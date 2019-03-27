'use strict';

const debug = true;

const _browser = typeof browser === 'undefined' ? chrome : browser;
const storage = _browser.storage.sync || _browser.storage.local;
let storedOptions = {};

initialize();

/**
  * Intialize background.js
  */
function initialize () {
  storage.get(null, options => {
    storedOptions = options;
    createCopyMenus();
    if (debug) console.log('options loaded', storedOptions);
  });

  // listen on changed settings
  _browser.storage.onChanged.addListener(updateSettings);
  // listen on menu commands
  _browser.commands.onCommand.addListener(handleCommand);
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
  */
function updateSettings (changes, namespace) {
  for (var key in changes) {
    storedOptions[key] = changes[key].newValue;
  }
  createCopyMenus();
  if (debug) console.log('settings changed', storedOptions);
}

/**
 * Open a new tab, and load "my-page.html" into it.
 */
function createCopyMenus () {
  _browser.contextMenus.removeAll();
  storedOptions.formats.forEach((format, index) => {
    if (format.value !== '') {
      _browser.contextMenus.create({
        title: format.name ? `Copy JIRA "${format.name}"` : `Copy JIRA "${index}"`,
        contexts: ['all'],
        onclick: (info, tab) => triggerCopyJiraData(index)
      });
    }
  });
}

/**
  * Handle a command
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
 */
function triggerCopyJiraData (formatIndex) {
  if (debug) console.log('triggerCopyJiraData', formatIndex);
  if (formatIndex >= storedOptions.formats.length) return;
  sendToTab('copyJiraData', storedOptions.formats[formatIndex].value);
}

/**
 * Send trigger and data to asctive tab
 */
function sendToTab (trigger, data = null, onResponse = null) {
  if (debug) console.info(`sendToTab: ${trigger}`, data);
  _browser.tabs.query({ active: true, currentWindow: true }, tabs => {
    _browser.tabs.sendMessage(tabs[0].id, { trigger: trigger, data: data }, onResponse);
  });
};

/**
  * Open jira ticket in new tab
  */
function openJiraTicket (issue) {
  _browser.tabs.create({ "url": storedOptions.jiraQuickSearchUrl + issue });
}

/**
  * Handles update of a tab to get a history of last recently visited jira tickets
  */
function handleUpdatedTab (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.status == 'complete' && tab.url != undefined) {
    if (storedOptions.jiraTicketUrls.split(',').some(url => tab.url.startsWith(url.trim()))) {
      console.log(`handleUpdatedTab found match ${tab.url}`);
      sendToTab('addToJiraHistory');
    }
  }
}
