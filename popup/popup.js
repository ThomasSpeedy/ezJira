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
      formats: [],
      history: []
    },
    options => {
      console.log('renderDialog');
      const form = document.getElementById('ticket-form');
      form.addEventListener('submit', handleSubmit);

      // newButton.addEventListener('click', handleSubmit);
      // currentButton.addEventListener('click', handleSubmit);

      // depending on the option attach newTab true or false to submit handler
      form.newTab = !options || options.defaultOption === 0 ? false : true;

      // Loop through all dropdown buttons to toggle between hiding and showing
      // its dropdown content - This allows the user to have multiple dropdowns
      // without any conflict
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

      setTimeout(() => document.querySelector('#ticket-input').focus(), 0);
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
      let content = document.createTextNode('Format ' + format.name ? format.name : format.index);
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
  const ticket = encodeURIComponent(document.querySelector('#ticket-input').value);
  if (ticket) {
    window.setTimeout(() => window.close(), 1000);
    _browser.extension.getBackgroundPage().openJiraTicket(ticket, event.target.newTab);
  }
};
