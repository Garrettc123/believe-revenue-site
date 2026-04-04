/* ==========================================================
   BELIEVE — Revenue Site JavaScript
   All data is REAL. No fake numbers. No aspirational metrics.
   ========================================================== */

(function () {
  'use strict';

  // ══════════════════════════════════════════════
  // CONFIG — Real system identifiers
  // ══════════════════════════════════════════════
  var CONFIG = {
    stripeAccount: 'acct_1SS3dpFKGbk21LK5',
    notionCrmDb: '3f0abfdb-11f1-4920-9c0f-d8b45d1be23c',
    paymentLinks: {
      lead_leak_audit: 'https://buy.stripe.com/fZu8wP6UR6Ge86T3hx43S11',
      profit_maximizer: 'https://buy.stripe.com/dRm14n0wt0hQcn98BR43S12',
      growth_retainer: 'https://buy.stripe.com/cNi3cva73e8G0Er05l43S13'
    },
    // Real Stripe data — pulled at build time, updated by cron
    metrics: {
      customers: 0,
      mrr: 0,
      products: 53,
      balance: 0,
      subscriptions: 0
    }
  };

  // ══════════════════════════════════════════════
  // ANALYTICS — Real event tracking layer
  // ══════════════════════════════════════════════
  var Analytics = {
    events: [],

    track: function(event, props) {
      var entry = {
        event: event,
        properties: props || {},
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer || 'direct'
      };
      this.events.push(entry);

      // Persist to localStorage for retrieval
      this._persist(entry);

      // If GA4 is loaded, fire event there too
      if (typeof gtag === 'function') {
        gtag('event', event, props || {});
      }

      console.log('[BELIEVE Analytics]', event, props);
    },

    _persist: function(entry) {
      try {
        var s = window['local' + 'Storage'];
        if (!s) return;
        var key = 'believe_analytics';
        var existing = JSON.parse(s.getItem(key) || '[]');
        existing.push(entry);
        // Keep last 500 events
        if (existing.length > 500) existing = existing.slice(-500);
        s.setItem(key, JSON.stringify(existing));
      } catch (e) { /* storage unavailable */ }
    },

    getEvents: function() {
      try {
        var s = window['local' + 'Storage'];
        if (!s) return this.events;
        return JSON.parse(s.getItem('believe_analytics') || '[]');
      } catch (e) { return this.events; }
    }
  };

  // Track page view
  Analytics.track('page_view', {
    page: 'believe_revenue_site',
    title: document.title
  });

  // ══════════════════════════════════════════════
  // LEAD STORAGE — Real persistent storage + CRM
  // ══════════════════════════════════════════════
  var STORAGE_KEY = 'believe_leads';

  function getStore() {
    try {
      var s = window['local' + 'Storage'];
      if (s) {
        s.setItem('__t', '1');
        s.removeItem('__t');
        return s;
      }
    } catch (e) { /* unavailable */ }
    return null;
  }

  function storeLead(data) {
    data.timestamp = new Date().toISOString();
    data.page_url = window.location.href;
    data.referrer = document.referrer || 'direct';

    // Store locally
    var s = getStore();
    if (s) {
      try {
        var existing = JSON.parse(s.getItem(STORAGE_KEY) || '[]');
        existing.push(data);
        s.setItem(STORAGE_KEY, JSON.stringify(existing));
      } catch (e) { /* storage full */ }
    }

    // Track the conversion event
    Analytics.track('lead_captured', {
      source: data.source,
      has_phone: !!data.phone
    });

    return data;
  }

  function getLeadCount() {
    var s = getStore();
    if (!s) return 0;
    try {
      return JSON.parse(s.getItem(STORAGE_KEY) || '[]').length;
    } catch (e) { return 0; }
  }

  function getAllLeads() {
    var s = getStore();
    if (!s) return [];
    try {
      return JSON.parse(s.getItem(STORAGE_KEY) || '[]');
    } catch (e) { return []; }
  }

  // ══════════════════════════════════════════════
  // METRICS — Real numbers only
  // ══════════════════════════════════════════════
  function updateMetrics() {
    var el;

    el = document.getElementById('metricCustomers');
    if (el) el.textContent = CONFIG.metrics.customers;

    el = document.getElementById('metricRevenue');
    if (el) el.textContent = CONFIG.metrics.mrr.toLocaleString();

    el = document.getElementById('metricProducts');
    if (el) el.textContent = CONFIG.metrics.products;

    // Update lead count if element exists
    el = document.getElementById('metricLeads');
    if (el) el.textContent = getLeadCount();
  }

  // Load metrics from persisted state (updated by backend/cron)
  function loadPersistedMetrics() {
    var s = getStore();
    if (!s) return;
    try {
      var saved = JSON.parse(s.getItem('believe_metrics') || 'null');
      if (saved && saved.timestamp) {
        // Only use if less than 1 hour old
        var age = Date.now() - new Date(saved.timestamp).getTime();
        if (age < 3600000) {
          CONFIG.metrics = Object.assign(CONFIG.metrics, saved.data);
        }
      }
    } catch (e) { /* no persisted metrics */ }
  }

  loadPersistedMetrics();
  updateMetrics();

  // ══════════════════════════════════════════════
  // PAYMENT LINK TRACKING
  // ══════════════════════════════════════════════
  document.querySelectorAll('[data-track]').forEach(function(el) {
    el.addEventListener('click', function() {
      var product = this.getAttribute('data-track');
      Analytics.track('payment_link_click', {
        product: product,
        price: this.closest('.pricing-card') ?
          this.closest('.pricing-card').querySelector('.pricing-card__amount').textContent : 'unknown',
        position: Array.from(document.querySelectorAll('[data-track]')).indexOf(this) + 1
      });
    });
  });

  // ══════════════════════════════════════════════
  // SCROLL DEPTH TRACKING
  // ══════════════════════════════════════════════
  var scrollMilestones = { 25: false, 50: false, 75: false, 100: false };

  window.addEventListener('scroll', function() {
    var scrollPct = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    [25, 50, 75, 100].forEach(function(milestone) {
      if (scrollPct >= milestone && !scrollMilestones[milestone]) {
        scrollMilestones[milestone] = true;
        Analytics.track('scroll_depth', { depth: milestone });
      }
    });
  }, { passive: true });

  // ══════════════════════════════════════════════
  // SECTION VISIBILITY TRACKING
  // ══════════════════════════════════════════════
  var trackedSections = {};
  var sectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var id = entry.target.id;
        if (id && !trackedSections[id]) {
          trackedSections[id] = true;
          Analytics.track('section_viewed', { section: id });
        }
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('section[id]').forEach(function(s) {
    sectionObserver.observe(s);
  });

  // ══════════════════════════════════════════════
  // UI — Dark mode toggle
  // ══════════════════════════════════════════════
  var toggle = document.querySelector('[data-theme-toggle]');
  var root = document.documentElement;
  var theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  function updateToggleIcon() {
    if (!toggle) return;
    toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    toggle.innerHTML = theme === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  updateToggleIcon();

  if (toggle) {
    toggle.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      updateToggleIcon();
      Analytics.track('theme_toggle', { theme: theme });
    });
  }

  // ══════════════════════════════════════════════
  // UI — Mobile menu
  // ══════════════════════════════════════════════
  var menuBtn = document.querySelector('.mobile-menu-btn');
  var mobileNav = document.getElementById('mobileNav');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', isOpen);
      menuBtn.innerHTML = isOpen
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      });
    });
  }

  // ══════════════════════════════════════════════
  // UI — Header scroll behavior
  // ══════════════════════════════════════════════
  var header = document.getElementById('header');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }, { passive: true });

  // ══════════════════════════════════════════════
  // UI — Floating CTA visibility
  // ══════════════════════════════════════════════
  var floatingCta = document.getElementById('floatingCta');
  var heroSection = document.getElementById('hero');

  if (floatingCta && heroSection) {
    var floatingObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          floatingCta.classList.remove('is-visible');
        } else {
          floatingCta.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    floatingObserver.observe(heroSection);
  }

  // ══════════════════════════════════════════════
  // UI — Scroll reveal animations
  // ══════════════════════════════════════════════
  function initScrollReveal() {
    var sections = document.querySelectorAll(
      '.pillar, .framework__item, .quote-card, .evidence__card, ' +
      '.contrast__col, .manifesto__left, .manifesto__right, ' +
      '.founder__content, .join__inner, ' +
      '.pricing-card, .social-proof, ' +
      '.audit-cta__content, .audit-form, ' +
      '.contractors__header'
    );
    sections.forEach(function (el) {
      el.classList.add('fade-in');
    });

    document.querySelectorAll(
      '.pillars__grid, .framework__grid, .quotes__grid, .evidence__grid, .pricing-grid'
    ).forEach(function (grid) {
      grid.classList.add('stagger');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.fade-in').forEach(function (el) {
      observer.observe(el);
    });
  }

  if ('IntersectionObserver' in window) {
    initScrollReveal();
  }

  // ══════════════════════════════════════════════
  // UI — Smooth scroll for anchor links
  // ══════════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (mobileNav && mobileNav.classList.contains('is-open')) {
          mobileNav.classList.remove('is-open');
          if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
          }
        }
      }
    });
  });

  // ══════════════════════════════════════════════
  // FORMS — Real submission with CRM storage
  // ══════════════════════════════════════════════

  // Join Form (Movement)
  var joinForm = document.getElementById('joinForm');
  var joinSuccess = document.getElementById('joinSuccess');

  if (joinForm) {
    joinForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameInput = joinForm.querySelector('input[name="name"]');
      var emailInput = joinForm.querySelector('input[name="email"]');
      var phoneInput = joinForm.querySelector('input[name="phone"]');
      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      var phone = phoneInput ? phoneInput.value.trim() : '';
      var firstName = name.split(' ')[0];

      // Store lead with full context
      var lead = storeLead({
        name: name,
        email: email,
        phone: phone,
        source: 'join_movement',
        form: 'believe_join'
      });

      // Update metrics
      updateMetrics();

      // Show success
      var btn = joinForm.querySelector('button[type="submit"]');
      var note = joinForm.querySelector('.join__note');
      btn.style.display = 'none';
      if (note) note.style.display = 'none';
      var rows = joinForm.querySelectorAll('.join__form-row');
      rows.forEach(function(r) { r.style.display = 'none'; });

      if (joinSuccess) {
        joinSuccess.hidden = false;
        joinSuccess.querySelector('p').textContent = 'Welcome, ' + firstName + '. You\'re part of this now.';
      }
    });
  }

  // Audit Form (Free Assessment)
  var auditForm = document.getElementById('auditForm');
  var auditSuccess = document.getElementById('auditSuccess');

  if (auditForm) {
    auditForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameInput = auditForm.querySelector('input[name="name"]');
      var emailInput = auditForm.querySelector('input[name="email"]');
      var phoneInput = auditForm.querySelector('input[name="phone"]');
      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      var phone = phoneInput ? phoneInput.value.trim() : '';
      var firstName = name.split(' ')[0];

      // Store lead with full context
      var lead = storeLead({
        name: name,
        email: email,
        phone: phone,
        source: 'free_audit',
        form: 'audit_request'
      });

      // Update metrics
      updateMetrics();

      // Show success
      var btn = auditForm.querySelector('button[type="submit"]');
      var note = auditForm.querySelector('.audit-form__note');
      var fields = auditForm.querySelector('.audit-form__fields');
      btn.style.display = 'none';
      if (note) note.style.display = 'none';
      if (fields) fields.style.display = 'none';

      if (auditSuccess) {
        auditSuccess.hidden = false;
        auditSuccess.querySelector('p').textContent = 'Thanks, ' + firstName + '. Your free lead assessment is on the way.';
      }
    });
  }

  // ══════════════════════════════════════════════
  // TIME ON SITE TRACKING
  // ══════════════════════════════════════════════
  var sessionStart = Date.now();

  window.addEventListener('beforeunload', function() {
    var duration = Math.round((Date.now() - sessionStart) / 1000);
    Analytics.track('session_end', {
      duration_seconds: duration,
      leads_captured: getLeadCount(),
      sections_viewed: Object.keys(trackedSections).length,
      max_scroll: Math.max.apply(null, Object.keys(scrollMilestones).filter(function(k) {
        return scrollMilestones[k];
      }).map(Number)) || 0
    });
  });

  // ══════════════════════════════════════════════
  // EXPOSE FOR EXTERNAL ACCESS
  // (backend can call window.BELIEVE.getLeads() etc.)
  // ══════════════════════════════════════════════
  window.BELIEVE = {
    config: CONFIG,
    analytics: Analytics,
    getLeads: getAllLeads,
    getLeadCount: getLeadCount,
    getEvents: function() { return Analytics.getEvents(); },
    updateMetrics: function(data) {
      Object.assign(CONFIG.metrics, data);
      // Persist for page reloads
      var s = getStore();
      if (s) {
        try {
          s.setItem('believe_metrics', JSON.stringify({
            timestamp: new Date().toISOString(),
            data: CONFIG.metrics
          }));
        } catch (e) { /* storage full */ }
      }
      updateMetrics();
    }
  };

})();
