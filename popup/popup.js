// Chrome and Opera do not support browser. http://stackoverflow.com/a/37646525/1902598
const _browser = this._browser || this.browser || this.chrome;
const _storage = _browser.storage.sync || _browser.storage.local;

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

const handleLastTicket = (event, defaultOption, lastTicket) => {
  if (event) {
    event.preventDefault();
  }
  window.setTimeout(() => window.close(), 1000);
  _browser.extension.getBackgroundPage().openJiraTicket(lastTicket, defaultOption);
};

const renderDialog = () => {
  _storage.get(
    {
      defaultOption: 0,
      lastTicket: '',
      history
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

      var historyList = document.getElementById('history');
      options.history.forEach(item => {
        let p = document.createElement("a");
        let content = document.createTextNode(`[${item.issue}] ${item.description}`);
        let parent = historyList.parentNode;
        p.setAttribute('href', item.url);
        p.appendChild(content);
        historyList.appendChild(p);
      });


      setTimeout(() => document.querySelector('.quiji-ticket-id').focus(), 0);
    }
  );
};

function addHistory () {
  //set the header of the panel
  var activeTabUrl = document.getElementById('header-title');
  var text = document.createTextNode("Cookies at: " + tab.title);
  var cookieList = document.getElementById('history');
  activeTabUrl.appendChild(text);

  if (cookies.length > 0) {
    //add an <li> item with the name and value of the cookie to the list
    for (let cookie of cookies) {
      let li = document.createElement("li");
      let content = document.createTextNode(cookie.name + ": " + cookie.value);
      li.appendChild(content);
      cookieList.appendChild(li);
    }
  } else {
    let p = document.createElement("p");
    let content = document.createTextNode("No cookies in this tab.");
    let parent = cookieList.parentNode;

    p.appendChild(content);
    parent.appendChild(p);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderDialog();
});

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
