'use strict';

const debug = true;

const _browser = typeof browser === 'undefined' ? chrome : browser;
const storage = _browser.storage.sync || _browser.storage.local;
let storedOptions = {};

storage.get(null, options => {
  storedOptions = options;
  createCopyMenus();
  if (debug) console.log('options loaded', storedOptions);
});

_browser.storage.onChanged.addListener(function (changes, namespace) {
  for (var key in changes) {
    storedOptions[key] = changes[key].newValue;
  }
  createCopyMenus();
  if (debug) console.log('settings changed', storedOptions);
});

_browser.browserAction.onClicked.addListener(
  _ev => triggerCopyJiraData(0)
);

_browser.commands.onCommand.addListener(command => {
  if (debug) console.log('command received', command);
  if (command.startsWith('copy')) {
    triggerCopyJiraData(command.substring(4, 5) - 1);
  }
});

if (_browser.omnibox) {
  _browser.omnibox.onInputEntered.addListener(text => {
    if (text.startsWith('copy')) {
      let words = text.split(' ');
      triggerCopyJiraData(words[1]);
    } else {
      openJiraTicket(text);
    }
  });
}


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


function triggerCopyJiraData (formatIndex) {
  if (debug) console.log('triggerCopyJiraData', formatIndex);
  if (formatIndex >= storedOptions.formats.length) return;
  sendToTab('copyJiraData', storedOptions.formats[formatIndex].value, handleResponse);
}

function sendToTab (trigger, data = null, onResponse = null) {
  if (debug) console.info(`sendToTab: ${trigger}`, data);
  _browser.tabs.query({ active: true, currentWindow: true }, tabs => {
    _browser.tabs.sendMessage(tabs[0].id, { trigger: trigger, data: data }, onResponse);
  });
};

/*
Open a new tab, and load "my-page.html" into it.
*/
function openJiraTicket (issue) {
  _browser.tabs.create({ "url": storedOptions.jiraUrl + issue });
}

const onError = errror =>
  console.error('error', error);
const handleResponse = msg =>
  console.log('handleResponse', msg);
console.log('background.js loaded');
