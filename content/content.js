'use strict';

const debug = true;

const _browser = typeof browser === 'undefined' ? chrome : browser;
const _storage = _browser.storage.sync || _browser.storage.local;

_browser.runtime.onMessage.addListener(dispatchRequest);

/**
 * Dispatch commands
 * @param {*} request
 * @param {*} sender
 * @param {*} sendResponse
 */
function dispatchRequest (request, sender, sendResponse) {
  switch (request.command) {
    case 'copyJiraToClipboard':
      copyJiraToClipboard(request.data);
      break;

    case 'addToJiraHistory':
      addToJiraHistory(request.data);
      break;

    case 'getJiraData':
      sendResponse(getJiraData(request.data));
      break;

    default:
      console.warning(`ezJira: Unknown request ${request.command}`);
      break;
  }
};

/**
 * Copy Jira data in given format to clipboard
 * @param {string} format - format string
 */
function copyJiraToClipboard (format) {
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
