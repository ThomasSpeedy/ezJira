'use strict';

const _browser = typeof browser === 'undefined' ? chrome : browser;
const storage = _browser.storage.sync || _browser.storage.local;

// Saves options to chrome.storage
function saveOptions () {
  let options = {
    jiraUrl: document.getElementById('jira_url').value,
    formats: []
  };
  console.log('saveOptions', options);
  for (var i = 0; i < 5; i++) {
    options.formats[i] = {
      //      name: document.getElementById('name0').value,
      // value: document.getElementById('value0').value
      // name: `name${i}`,
      // value: `value${i}`
      name: document.getElementById(`name${i}`).value,
      value: document.getElementById(`value${i}`).value
    }
  };
  console.log('saveOptions', options);
  storage.set(options, () => {
    // Update status to let user know options were saved.
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function () {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions () {
  storage.get(null, options => {
    document.getElementById('jira_url').value = options.jiraUrl ? options.jiraUrl : '';
    // document.getElementById('name0').value = options.formats[0].name ? options.formats[0].name : '';
    // document.getElementById('value0').value = options.formats[0].value ? options.formats[0].value : '';
    for (var i = 0; i < 5; i++) {
      document.getElementById(`name${i}`).value = options.formats[i].name ? options.formats[i].name : '';
      document.getElementById(`value${i}`).value = options.formats[i].value ? options.formats[i].value : '';
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
