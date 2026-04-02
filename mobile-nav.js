(function () {
  function initMobileNav() {
    if (!document.body || document.querySelector('.maya-mobile-nav')) {
      return;
    }

    var currentPath = window.location.pathname
      .replace(/index\.html$/, '')
      .replace(/\/$/, '');
    var currentKeyMatch = currentPath.match(/(blank(?:-\d+)?)$/);
    var currentKey = currentKeyMatch ? currentKeyMatch[1] : 'home';
    var prefix = currentKey === 'home' ? './' : '../';
    var items = [
      { key: 'home', label: 'Home', href: prefix },
      { key: 'blank-1', label: 'Individual Sessions', href: prefix + 'blank-1/' },
      { key: 'blank-4', label: 'Group Workshops', href: prefix + 'blank-4/' },
      { key: 'blank-2', label: 'About', href: prefix + 'blank-2/' },
      { key: 'blank', label: 'Contact', href: prefix + 'blank/' },
      { key: 'blank-3', label: 'FAQ', href: prefix + 'blank-3/' },
    ];

    var nav = document.createElement('div');
    nav.className = 'maya-mobile-nav';
    nav.innerHTML =
      '<button type="button" class="maya-mobile-nav__toggle" aria-expanded="false" aria-controls="maya-mobile-nav-panel" aria-label="Open site menu">' +
      '<span class="maya-mobile-nav__toggle-icon" aria-hidden="true"><span></span><span></span><span></span></span>' +
      '<span class="maya-mobile-nav__toggle-label">Menu</span>' +
      '</button>' +
      '<div class="maya-mobile-nav__overlay" hidden>' +
      '<div class="maya-mobile-nav__panel" id="maya-mobile-nav-panel" role="dialog" aria-modal="true" aria-label="Site navigation">' +
      '<div class="maya-mobile-nav__panel-header">' +
      '<div class="maya-mobile-nav__eyebrow">Grounded Within</div>' +
      '<button type="button" class="maya-mobile-nav__close" aria-label="Close site menu">Close</button>' +
      '</div>' +
      '<ul class="maya-mobile-nav__list">' +
      items
        .map(function (item) {
          var current = item.key === currentKey ? ' aria-current="page"' : '';
          return (
            '<li><a class="maya-mobile-nav__link" href="' +
            item.href +
            '"' +
            current +
            '>' +
            item.label +
            '</a></li>'
          );
        })
        .join('') +
      '</ul>' +
      '</div>' +
      '</div>';

    document.body.appendChild(nav);

    var toggle = nav.querySelector('.maya-mobile-nav__toggle');
    var overlay = nav.querySelector('.maya-mobile-nav__overlay');
    var panel = nav.querySelector('.maya-mobile-nav__panel');
    var closeButton = nav.querySelector('.maya-mobile-nav__close');
    var linkNodes = nav.querySelectorAll('.maya-mobile-nav__link');

    function openNav() {
      nav.classList.add('is-open');
      document.body.classList.add('maya-mobile-nav-open');
      toggle.setAttribute('aria-expanded', 'true');
      overlay.hidden = false;
      closeButton.focus();
    }

    function closeNav() {
      nav.classList.remove('is-open');
      document.body.classList.remove('maya-mobile-nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      overlay.hidden = true;
      toggle.focus();
    }

    toggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) {
        closeNav();
        return;
      }

      openNav();
    });

    closeButton.addEventListener('click', closeNav);

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        closeNav();
      }
    });

    panel.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    linkNodes.forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        document.body.classList.remove('maya-mobile-nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        overlay.hidden = true;
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
      }
    });

    if (new URLSearchParams(window.location.search).get('menu') === 'open') {
      openNav();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav, { once: true });
    return;
  }

  initMobileNav();
})();
