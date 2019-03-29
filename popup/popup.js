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
      defaultOption: 0,
      lastTicket: '',
      formats: [],
      history: []
    },
    options => {
      console.log('renderDialog');
      const form = document.querySelector('.quiji-popup-form');
      const newButton = document.querySelector('.quiji-new-tab');
      newButton.newTab = true;
      const currentButton = document.querySelector('.quiji-current-tab');
      currentButton.newTab = false;

      const lastTicketButton = createLastTicketButton(options);

      form.addEventListener('submit', handleSubmit);
      newButton.addEventListener('click', handleSubmit);
      currentButton.addEventListener('click', handleSubmit);

      // depending on the option attach newTab true or false to submit handler
      form.newTab = !options || options.defaultOption === 0 ? false : true;

      //* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
      var dropdown = document.getElementsByClassName("dropdown-btn");
      var i;

      for (i = 0; i < dropdown.length; i++) {
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

      renderCopy(options.formats);
      renderHistory(options.history);

      setTimeout(() => document.querySelector('.quiji-ticket-id').focus(), 0);
    }
  );
}

/**
 * Open a new tab, and load "my-page.html" into it.
 */
function renderCopy (formats) {
  var historyList = document.getElementById('copyMenu');
  formats.forEach((format, index) => {
    if (format.value !== '') {
      let element = document.createElement("button");
      let content = document.createTextNode(format.name ? `Copy JIRA "${format.name}"` : `Copy JIRA "${index}"`);
      //      let parent = historyList.parentNode;
      element.formatId = index;
      element.addEventListener('click', handleFormatClick);
      element.appendChild(content);
      historyList.appendChild(element);
    }
  });
}


/**
 *
 * @param {*} event
 */
const handleFormatClick = event => {
  if (event) {
    event.preventDefault();
  }
  window.setTimeout(() => window.close(), 100);
  _browser.extension.getBackgroundPage().triggerCopyJiraData(event.target.formatId);
};

/**
 *
 */
function renderHistory (history) {
  // //set the header of the panel
  // var activeTabUrl = document.getElementById('header-title');
  // var text = document.createTextNode("Cookies at: " + tab.title);
  // var cookieList = document.getElementById('history');
  // activeTabUrl.appendChild(text);

  // if (cookies.length > 0) {
  //   //add an <li> item with the name and value of the cookie to the list
  //   for (let cookie of cookies) {
  //     let li = document.createElement("li");
  //     let content = document.createTextNode(cookie.name + ": " + cookie.value);
  //     li.appendChild(content);
  //     cookieList.appendChild(li);
  //   }
  // } else {
  //   let p = document.createElement("p");
  //   let content = document.createTextNode("No cookies in this tab.");
  //   let parent = cookieList.parentNode;

  //   p.appendChild(content);
  //   parent.appendChild(p);
  // }

  var historyList = document.getElementById('historyMenu');
  history.forEach(item => {
    let element = document.createElement("a");
    let content = document.createTextNode(`[${item.issue}] ${item.description}`);
    element.setAttribute('href', item.url);
    element.setAttribute('target', '_blank');
    element.appendChild(content);
    historyList.appendChild(element);
  });
}

/**
 *
 * @param {*} event
 */
const handleSubmit = event => {
  if (event) {
    event.preventDefault();
  }
  const ticket = encodeURIComponent(document.querySelector('.quiji-ticket-id').value);
  if (ticket) {
    window.setTimeout(() => window.close(), 1000);
    _browser.extension.getBackgroundPage().openJiraTicket(ticket, event.target.newTab);
  }
};

/**
 *
 * @param {*} event
 * @param {*} defaultOption
 * @param {*} lastTicket
 */
const handleLastTicket = (event, defaultOption, lastTicket) => {
  if (event) {
    event.preventDefault();
  }
  window.setTimeout(() => window.close(), 1000);
  _browser.extension.getBackgroundPage().openJiraTicket(lastTicket, defaultOption);
};

/**
 *
 * @param {*} options
 */
function createLastTicketButton (options) {
  const lastTicketButton = document.querySelector('.quiji-last-ticket');
  if (options) {
    if (!options.lastTicket) {
      lastTicketButton.disabled = true;
    } else {
      lastTicketButton.addEventListener('click', e => handleLastTicket(e, options.defaultOption, options.lastTicket));
    }
  }
  return lastTicketButton;
}
