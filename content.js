'use strict';

const debug = true;

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg.trigger === 'copyJiraData') {
    copyJiraData(msg.data);
  };
});

function copyJiraData (format) {
  let issue = document.getElementById('key-val');
  if (!issue) console.log('ezJira: Copy not possible - no valid jira page');
  let simpleReplacements = {};
  let replacements = {};
  let text;

  simpleReplacements["%Description%"] = document.getElementById('summary-val').innerText;
  simpleReplacements["%Issue%"] = issue.getAttribute('data-issue-key');
  simpleReplacements["%Branchname%"] = sanitizeBranchName(simpleReplacements["%Issue%"] + ' ' + simpleReplacements["%Description%"]);
  simpleReplacements["%Parentissue%"] = document.getElementById('parent_issue_summary');
  simpleReplacements["%Url%"] = window.location.href;

  Object.keys(simpleReplacements).forEach(key => {
    replacements[key] = simpleReplacements[key] ? simpleReplacements[key] : '';
    replacements[key.toUpperCase()] = replacements[key].toUpperCase();
    replacements[key.toLowerCase()] = replacements[key].toLowerCase();
  });

  text = format.replace(/%\w+%/g, all => replacements[all] || all);

  if (debug) console.log(`copied ${text} to clipboard`);
  copyToClipboard(text);
}

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

// This function must be called in a visible page, such as a browserAction popup
// or a content script. Calling it in a background page has no effect!
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
}
/*
copy the selected text to clipboard
*/
function copySelection () {
  var selectedText = window.getSelection().toString().trim();

  if (selectedText) {
    document.execCommand("Copy");
  }
}

