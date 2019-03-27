'use strict';

const _browser = typeof browser === 'undefined' ? chrome : browser;
const _storage = _browser.storage.sync || _browser.storage.local;

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);

/**
 * Save user preferences from document to storage
 */
function saveOptions () {
  let options = {
    jiraQuickSearchUrl: document.getElementById('jira_quick_search_url').value,
    jiraTicketUrls: document.getElementById('jira_ticket_urls').value,
    formats: []
  };
  console.log('saveOptions', options);
  for (var i = 0; i < 5; i++) {
    options.formats[i] = {
      name: document.getElementById(`name${i}`).value,
      value: document.getElementById(`value${i}`).value
    }
  };
  console.log('saveOptions', options);
  _storage.set(options, () => {
    // Update status to let user know options were saved.
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function () {
      status.textContent = '';
    }, 750);
  });
}

/**
 * Load user preferences from storage and set it to document
 */
function restoreOptions () {
  _storage.get(null, options => {
    document.getElementById('jira_quick_search_url').value = options.jiraQuickSearchUrl ? options.jiraQuickSearchUrl : '';
    document.getElementById('jira_ticket_urls').value = options.jiraTicketUrls ? options.jiraTicketUrls : '';

    // load copy formats
    for (var i = 0; i < 5; i++) {
      document.getElementById(`name${i}`).value = options.formats[i].name ? options.formats[i].name : '';
      document.getElementById(`value${i}`).value = options.formats[i].value ? options.formats[i].value : '';
    }
  });
}
