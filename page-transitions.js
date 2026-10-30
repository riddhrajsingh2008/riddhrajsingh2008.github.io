/**
 * Tsukuyomi Watch — Component Kinetic Page Transitions
 * Pushes different components of the page against each other and out of the webpage,
 * then has the new page components arrive to take their place.
 * Clean ink/dark aesthetic with NO yellow explosion or middle flash.
 */
(function () {
  'use strict';

  let isTransitioning = false;

  // Resolve file basename for current page
  function getCurrentPageName() {
    const path = window.location.pathname;
    const name = path.substring(path.lastIndexOf('/') + 1);
    return name === '' ? 'index.html' : name.toLowerCase();
  }

  // Check if a link is an internal page target
  function isInternalTransitionLink(link) {
    if (!link || !link.getAttribute) return false;
    const href = link.getAttribute('href');
    if (!href) return false;

    // Ignore hash, mailto, tel, javascript
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return false;
    }

    // Ignore external links with protocol or target _blank
    if (link.target === '_blank' || href.startsWith('http://') || href.startsWith('https://')) {
      return false;
    }

    // Clean target filename
    const cleanHref = href.split('#')[0].split('?')[0].toLowerCase();
    const targetFile = cleanHref.substring(cleanHref.lastIndexOf('/') + 1);

    // List of site pages
    const sitePages = ['index.html', 'watchtower.html', 'celestial-scroll.html', 'spirit-lens.html'];

    if (sitePages.includes(targetFile)) {
      // Don't transition if link points to the page we are already on
      if (targetFile === getCurrentPageName()) {
        return false;
      }
      return true;
    }

    return false;
  }

  // Handle entry animation when page loads
  function runPageEnter() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    document.body.classList.remove('page-push-exit', 'page-push-settled');
    document.body.classList.add('page-push-enter');

    // Remove entrance classes after completion so layout & interactions remain crisp
    setTimeout(() => {
      document.body.classList.remove('page-push-enter');
      document.body.classList.add('page-push-settled');
    }, 600);
  }

  // Execute the collision push-out transition
  function triggerPageExit(destinationUrl) {
    if (isTransitioning) return;
    isTransitioning = true;

    // Remove entry / settled classes
    document.body.classList.remove('page-push-enter', 'page-push-settled');

    // Trigger kinetic collision & push-out animation across components
    document.body.classList.add('page-push-exit');

    // After components push against each other and fly out of the webpage, navigate
    setTimeout(() => {
      window.location.href = destinationUrl;
    }, 500);
  }

  // Global click delegate for all internal navigation
  document.addEventListener('click', function (e) {
    // Ignore modified clicks (cmd, ctrl, shift, alt)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    // Find nearest ancestor <a> element
    const link = e.target.closest('a');
    if (!link) return;

    if (isInternalTransitionLink(link)) {
      e.preventDefault();
      const destination = link.getAttribute('href');
      triggerPageExit(destination);
    }
  }, true);

  // Initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPageEnter);
  } else {
    runPageEnter();
  }

  // Handle browser back/forward navigation (bfcache)
  window.addEventListener('pageshow', function (event) {
    isTransitioning = false;
    document.body.classList.remove('page-push-exit');
    runPageEnter();
  });
})();
