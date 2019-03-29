'use strict';

const debug = true;

const _browser = typeof browser === 'undefined' ? chrome : browser;
const _storage = _browser.storage.sync || _browser.storage.local;
let store = {
  formats: [],
  history: [],
  jiraQuickSearchUrl: '',
  jiraTicketUrls: ''
};

initialize();

/**
 * Intialize background.js
 */
function initialize () {
  _storage.get(store, options => {
    store = options;
    if (debug) console.log('options loaded', store);
  });

  // listen on changed settings
  _browser.storage.onChanged.addListener(updateSettings);

  // listen on omnibox commands
  if (_browser.omnibox) {
    _browser.omnibox.onInputEntered.addListener(handleCommand);
  }

  // listen to tab URL changes
  _browser.tabs.onUpdated.addListener(handleUpdatedTab);

  if (debug) console.log('background.js loaded');
}

/**
 * Update storedSettings after user changed settings
 * @param {*} changes
 * @param {*} namespace
 */
function updateSettings (changes, namespace) {
  if (debug) console.log('settings changed', changes, namespace);
  for (var key in changes) {
    store[key] = changes[key].newValue;
  }
  if (debug) console.log('settings changed', store, namespace);
}

/**
 * Handle a command
 * @param {*} command
 */
function handleCommand (command) {
  if (command.startsWith('copy')) {
    let words = text.split(' ');
    triggerCopyJiraData(words[1]);
  } else {
    openJiraTicket(command);
  }
}

/**
 * Trigger copyJiraData in content page
 * @param {*} formatIndex
 */
function triggerCopyJiraData (formatIndex) {
  if (debug) console.log('triggerCopyJiraData', formatIndex);
  if (formatIndex >= store.formats.length) return;
  sendToTab('copyJiraToClipboard', store.formats[formatIndex].value);
}

/**
 * Send trigger and data to asctive tab
 * @param {*} command
 * @param {*} data
 * @param {*} onResponse
 */
function sendToTab (command, data = null, onResponse = null) {
  _browser.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (debug) console.info(`sendToTab: ${command}`, tabs, data);
    _browser.tabs.sendMessage(tabs[0].id, { command: command, data: data }, onResponse);
  });
};

/**
 * Open jira ticket in new tab
 * @param {*} issue
 */
function openJiraTicket (issue) {
  _browser.tabs.create({ "url": store.jiraQuickSearchUrl + issue });
}

/**
 * Handles update of a tab to get a history of last recently visited jira tickets
 * @param {*} tabId
 * @param {*} changeInfo
 * @param {*} tab
 */
function handleUpdatedTab (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.status == 'complete' && tab.url != undefined) {
    if (store.jiraTicketUrls.split(',').some(url => tab.url.startsWith(url.trim()))) {
      console.log(`handleUpdatedTab found match ${tab.url}`);
      //      sendToTab('addToJiraHistory');
      sendToTab('getJiraData', null, jiraData => {
        console.log('handleUpdatedTab', jiraData);
        addToJiraHistory(jiraData);
      });
    }
  }
}

/**
 * add the jira issue of the active tab to jira history
 * @param {*} jiraData
 */
function addToJiraHistory (jiraData) {
  let index;

  if (!jiraData) return;

  // remove this jira ticket if it is already in history
  index = store.history.findIndex(item => item.url === jiraData.url);
  if (index !== -1) {
    store.history.splice(index, 1);
  }

  // add jira ticket to begin of array
  store.history.unshift(jiraData);

  // remove last ticket if history gets to big
  if (store.history.length > 10) {
    store.history.pop();
  }

  // save history to storage
  _storage.set({ history: store.history });
}
