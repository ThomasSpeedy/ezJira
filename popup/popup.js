const _browser = this._browser || this.browser || this.chrome;
const _storage = _browser.storage.sync || _browser.storage.local;

document.addEventListener('DOMContentLoaded', () => {
  renderDialog();
});

/**
 * Render popup dialog
 */
function renderDialog () {
  _storage.get(
    {
      openInNewTab: true,
      formats: [],
      history: []
    },
    options => {
      document.getElementById('ticket-form').addEventListener('submit', handleSubmit);
      document.getElementById('btn-open-ticket').addEventListener('submit', handleSubmit);
      document.getElementById('open-in-new-tab').checked = options.openInNewTab;

      renderCopyMenu(options.formats);
      renderHistoryMenu(options.history);

      setupDropdownButtons();

      // set focus to ticket input
      setTimeout(() => document.querySelector('#ticket-input').focus(), 0);
    }
  );
}

/**
 * Open jira ticket
 * @param {*} event - click event
 */
function handleSubmit (event) {
  if (event) {
    event.preventDefault();
  }
  const ticket = encodeURIComponent(document.querySelector('#ticket-input').value);
  if (ticket) {
    window.setTimeout(() => window.close(), 1000);
    _browser.extension.getBackgroundPage().openJiraTicket(ticket, openInNewTab());
  }
}

/**
 * Returns if a ticket should be opened in new or in active tab
 * @return {boolean} returns true if ticket should be openend in new
 * tab; otherwise false
 */
function openInNewTab () {
  return document.getElementById('open-in-new-tab').checked;
}

/**
 * Loop through all dropdown buttons to toggle between hiding and showing
 * its dropdown content - This allows the user to have multiple dropdowns
 * without any conflict
 */
function setupDropdownButtons () {
  let dropdown = document.getElementsByClassName("dropdown-btn");

  for (let i = 0; i < dropdown.length; i++) {
    dropdown[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var dropdownContent = this.nextElementSibling;
      if (dropdownContent.style.display === "block") {
        dropdownContent.style.display = "none";
      } else {
        dropdownContent.style.display = "block";
      }
    });
  }
}

/**
 * Render array with copy formats as buttons into copyMenu
 * @param {Object[]} formats - Array with copy formats
 */
function renderCopyMenu (formats) {
  let copyMenu = document.getElementById('copyMenu');
  formats.forEach((format, index) => {
    if (format.value !== '') {
      let element = document.createElement("button");
      let content = document.createTextNode('Format ' + format.name ? format.name : format.index);
      element.formatId = index;
      element.addEventListener('click', handleCopyClick);
      element.appendChild(content);
      copyMenu.appendChild(element);
    }
  });
}

/**
 * Trigger copy of jira data into clipboard
 * @param {*} event - click event
 */
function handleCopyClick (event) {
  if (event) {
    event.preventDefault();
  }
  window.setTimeout(() => window.close(), 100);
  _browser.extension.getBackgroundPage().triggerCopyJiraData(event.target.formatId);
}

/**
 * Render array with recently opened jira tickets as hyperlinks
 * into dropdown menu historyMenu
 * @param {Object[]} history - Array with recently opened jia tickets
 */
function renderHistoryMenu (history) {
  let historyMenu = document.getElementById('historyMenu');
  history.forEach(item => {
    let element = document.createElement("a");
    let content = document.createTextNode(`[${item.issue}] ${item.description}`);
    element.setAttribute('href', item.url);

    element.appendChild(content);
    element.addEventListener('click', handleHistoryClick);
    historyMenu.appendChild(element);
  });
}

/**
 * Open the url either in same or in a new tab. This has to be done
 * with function openUrl or background.js because 'target'='_self'
 * does not work in a popup
 * @param {*} event - click event
 */
function handleHistoryClick (event) {
  if (event) {
    event.preventDefault();
  }
  window.setTimeout(() => window.close(), 100);
  _browser.extension.getBackgroundPage().openUrl(
    event.target.attributes.getNamedItem('href').value, openInNewTab());
}
