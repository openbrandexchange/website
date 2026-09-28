// Progressive enhancement only: every page works without this file.
(function () {
  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle.
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.getElementById('site-nav');
    if (toggle && nav) {
      toggle.hidden = false;
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    // Copy buttons on code and text blocks.
    var labels = document.body.dataset;
    var status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.className = 'sr-status';
    document.body.appendChild(status);

    if (!navigator.clipboard) return;
    document.querySelectorAll('pre[data-copyable]').forEach(function (pre) {
      var box = document.createElement('div');
      box.className = 'code-box';
      pre.parentNode.insertBefore(box, pre);
      box.appendChild(pre);
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-button';
      button.textContent = labels.copy || 'Copy';
      box.appendChild(button);
      button.addEventListener('click', function () {
        navigator.clipboard.writeText(pre.innerText).then(function () {
          button.textContent = labels.copied || 'Copied';
          status.textContent = labels.copied || 'Copied';
          setTimeout(function () {
            button.textContent = labels.copy || 'Copy';
          }, 2000);
        });
      });
    });
  });
})();

// Directory search (progressive enhancement; the full list is in the HTML).
document.addEventListener('DOMContentLoaded', function () {
  var tools = document.querySelector('[data-dir-tools]');
  var input = document.querySelector('[data-dir-search]');
  if (!tools || !input) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-dir-list] [data-search]'));
  var empty = document.querySelector('[data-dir-empty]');
  tools.hidden = false;
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var match = !q || card.getAttribute('data-search').indexOf(q) !== -1;
      card.hidden = !match;
      if (match) shown++;
    });
    if (empty) empty.hidden = shown !== 0;
  });
});

// Remember a language the visitor picks, so the home address opens in it next time.
// Stored only in this browser (localStorage), never sent anywhere.
document.addEventListener('click', function (event) {
  var link = event.target && event.target.closest ? event.target.closest('[data-lang-choice]') : null;
  if (!link) return;
  try {
    localStorage.setItem('obx-lang', link.getAttribute('data-lang-choice'));
  } catch (e) {
    /* storage unavailable: the choice is simply not remembered */
  }
});

// Close the language list on a click outside it or on Escape.
document.addEventListener('click', function (event) {
  var open = document.querySelector('.lang-switch[open]');
  if (open && !open.contains(event.target)) open.removeAttribute('open');
});
document.addEventListener('keydown', function (event) {
  if (event.key !== 'Escape') return;
  var open = document.querySelector('.lang-switch[open]');
  if (open) {
    open.removeAttribute('open');
    open.querySelector('summary').focus();
  }
});
