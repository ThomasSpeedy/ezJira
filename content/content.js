'use strict';

const debug = true;

const _browser = typeof browser === 'undefined' ? chrome : browser;
const _storage = _browser.storage.sync || _browser.storage.local;
let jiraHistory = [];

_browser.runtime.onMessage.addListener(dispatchCommands);
loadJiraHistory();

/**
 * Dispatch commands
 * @param {*} msg
 * @param {*} sender
 * @param {*} respond
 */
function dispatchCommands (msg, sender, respond) {
  if (msg.trigger === 'copyJiraData') {
    copyJiraData(msg.data);
  } else if (msg.trigger === 'addToJiraHistory') {
    addToJiraHistory();
  };
};

/**
 * Load jira history
 */
function loadJiraHistory () {
  _storage.get(['history'], result => {
    if (result) {
      jiraHistory = result;
    }
  });
}

/**
 * Copy Jira data in given format to clipboard
 * @param {string} format - format string
 */
function copyJiraData (format) {
  const jiraData = getJiraData();
  if (!jiraData) return;
  let simpleReplacements = {};
  let replacements = {};

  simpleReplacements["%Description%"] = jiraData.description;
  simpleReplacements["%Issue%"] = jiraData.issue;
  simpleReplacements["%Branchname%"] = jiraData.branchName;
  simpleReplacements["%Url%"] = jiraData.url;

  Object.keys(simpleReplacements).forEach(key => {
    replacements[key] = simpleReplacements[key] ? simpleReplacements[key] : '';
    replacements[key.toUpperCase()] = replacements[key].toUpperCase();
    replacements[key.toLowerCase()] = replacements[key].toLowerCase();
  });

  copyToClipboard(format.replace(/%\w+%/g, all => replacements[all] || all));
}

/**
 * Get jira data of actual page
 * @param {string} format - format string
 * @returns {object}
 */
function getJiraData () {
  let jiraData = {};
  let issue = document.getElementById('key-val');
  if (!issue) {
    console.error('ezJira: no valid jira page');
    return;
  }
  jiraData.description = document.getElementById('summary-val').innerText;
  jiraData.issue = issue.getAttribute('data-issue-key');
  jiraData.branchName = sanitizeBranchName(jiraData.issue + ' ' + jiraData.description);
  jiraData.url = window.location.href;

  return jiraData;
}

/**
 * Sanitize the branch name passed in text to a format usabled as branch name by git
 * @param {string} text - branch name
 * @returns sanitized branch name
 */
function sanitizeBranchName (text) {
  if (!text) return '';
  // replace special characters
  text = text.replace(/[;\/:*?\"<>|&\.'\[\]]/g, '');
  // delete multiple whitespaces
  text = text.replace(/\s{2,}/g, ' ');
  // replace whitespace with dash
  text = text.replace(/\s/g, '-');
  return text;
}

/**
 * This function must be called in a visible page, such as a browserAction popup
 * or a content script. Calling it in a background page has no effect!
 * @param {*} text
 * @param {*} html
 */
function copyToClipboard (text, html) {
  function oncopy (event) {
    document.removeEventListener("copy", oncopy, true);
    // Hide the event from the page to prevent tampering.
    event.stopImmediatePropagation();

    // Overwrite the clipboard content.
    event.preventDefault();
    event.clipboardData.setData("text/plain", text);
    if (!html) {
      html = text;
    }
    event.clipboardData.setData("text/html", html);
  }
  document.addEventListener("copy", oncopy, true);

  // Requires the clipboardWrite permission, or a user gesture:
  document.execCommand("copy");
}

/**
 *
 * @param {*} str
 */
function copyStringToClipboard (str) {
  // Create new element
  var el = document.createElement('textarea');
  // Set value (string to be copied)
  el.value = str;
  // Set non-editable to avoid focus and move outside of view
  el.setAttribute('readonly', '');
  el.style = { position: 'absolute', left: '-9999px' };
  document.body.appendChild(el);
  // Select text inside element
  el.select();
  // Copy text to clipboard
  document.execCommand('copy');
  // Remove temporary element
  document.body.removeChild(el);
  if (debug) console.log(`copied ${text} to clipboard`);
}

/**
 * add the jira issue of the active tab to jira history
 */
function addToJiraHistory () {
  const jiraData = getJiraData();
  if (!jiraData) return;

  _storage.get(['history'], result => {
    let history = [];
    let index;

    if (result.history) {
      history = result.history;
    }

    // remove this jira ticket if it is already in history
    index = history.findIndex(item => item.url === jiraData.url);
    if (index !== -1) {
      history.splice(index, 1);
    }

    // add jira ticket to begin of array
    history.unshift(jiraData);

    // remove last ticket if history gets to big
    if (history.length > 10) {
      history.pop();
    }

    // save history to storage
    _storage.set({ history: history });
  });
}
