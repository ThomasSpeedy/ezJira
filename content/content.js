'use strict';

const debug = true;

const _browser = typeof browser === 'undefined' ? chrome : browser;
const _storage = _browser.storage.sync || _browser.storage.local;

_browser.runtime.onMessage.addListener(dispatchCommands);

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
 * Copy Jira data in given format to clipboard
 * @param {string} format - format string
 */
function copyJiraData (format) {
  const jiraData = getJiraData();
  if (!jiraData) {
    if (debug) console.log(`copyJiraData unable to get jira data`);
    return;
  }
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
  function onCopy (event) {
    document.removeEventListener("copy", onCopy, true);
    // Hide the event from the page to prevent tampering.
    event.stopImmediatePropagation();

    // Overwrite the clipboard content.
    event.preventDefault();
    event.clipboardData.setData("text/plain", text);
    if (!html) {
      html = text;
    }
    event.clipboardData.setData("text/html", html);
    if (debug) console.log(`copied ${text} to clipboard`);
  }
  document.addEventListener("copy", onCopy, true);

  // Requires the clipboardWrite permission, or a user gesture:
  document.execCommand("copy");
}

/**
 * add the jira issue of the active tab to jira history
 */
function addToJiraHistory () {
  const jiraData = getJiraData();
  if (!jiraData) return;

  _storage.get({ history: [] }, items => {
    let history = items.history;
    let index;

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
