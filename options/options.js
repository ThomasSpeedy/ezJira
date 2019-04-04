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
    maxHistoryEntries: document.getElementById('max-history-entries').value,
    openInNewTab: document.getElementById('open-in-new-tab').checked,
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
    window.setTimeout(() => window.close(), 100);
  });
}

/**
 * Load user preferences from storage and set it to document
 */
function restoreOptions () {
  _storage.get({
    formats: [
      {
        name: 'default',
        value: '[%Issue%] %Description%'
      },
      {
        name: 'default + url',
        value: '[%Issue%] %Description% (%Url%)'
      },
      {
        name: '%branchname%',
        value: 'branchname'
      },
      {
        name: 'feat commit msg',
        value: 'feat(%Issue%): %description%'
      },
      {
        name: 'html',
        value: '<a href="%Url%">[%Issue%] %Description%</a>'
      },
    ],
    maxHistoryEntries: 15,
    jiraQuickSearchUrl: '',
    jiraTicketUrls: '',
    openInNewTab: true
  }, options => {
    document.getElementById('jira_quick_search_url').value = options.jiraQuickSearchUrl ? options.jiraQuickSearchUrl : '';
    document.getElementById('jira_ticket_urls').value = options.jiraTicketUrls ? options.jiraTicketUrls : '';
    document.getElementById('max-history-entries').value = options.maxHistoryEntries ? options.maxHistoryEntries : '';
    document.getElementById('open-in-new-tab').checked = options.openInNewTab ? options.openInNewTab : false;

    // load copy formats
    for (var i = 0; i < 5; i++) {
      document.getElementById(`name${i}`).value = options.formats[i].name ? options.formats[i].name : '';
      document.getElementById(`value${i}`).value = options.formats[i].value ? options.formats[i].value : '';
    }
  });
}
