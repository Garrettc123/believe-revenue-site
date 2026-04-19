// BELIEVE — Church AI Systems
// Main JS: Nav + Analytics + Lead Capture + CTA Tracking

document.addEventListener('DOMContentLoaded', () => {

  // ── Meta Pixel ──────────────────────────────────────────────
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  // REPLACE: fbq('init', 'YOUR_PIXEL_ID');
  // fbq('track', 'PageView');

  // ── GA4 ─────────────────────────────────────────────────────
  // REPLACE YOUR_GA4_ID with your actual Measurement ID (G-XXXXXXXX)
  const ga4Script = document.createElement('script');
  ga4Script.async = true;
  ga4Script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
  document.head.appendChild(ga4Script);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX'); // REPLACE with your GA4 ID
  window._gtag = gtag;

  // ── Nav scroll effect ────────────────────────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav-scrolled', window.scrollY > 40);
  });

  // ── Smooth scroll ────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // ── CTA click tracking ───────────────────────────────────────
  document.querySelectorAll('.btn-primary, .btn-outline, .btn-ghost').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.textContent.trim();
      if (window.fbq) fbq('track', 'Lead', { content_name: label });
      if (window._gtag) _gtag('event', 'cta_click', { event_category: 'CTA', event_label: label });
    });
  });

  // ── Lead capture form submission ─────────────────────────────
  const form = document.getElementById('lead-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      const btn = form.querySelector('button[type=submit]');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      try {
        // Sends to Formspree — REPLACE YOUR_FORM_ID below
        const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          form.innerHTML = '<p class="form-success">✅ We\'ll reach out within 24 hours. Check your email!</p>';
          if (window.fbq) fbq('track', 'CompleteRegistration', { content_name: 'Lead Form' });
          if (window._gtag) _gtag('event', 'generate_lead', { event_category: 'Lead' });
        } else {
          btn.textContent = 'Try Again';
          btn.disabled = false;
          alert('Something went wrong. Email us directly: carrolgarrett55@gmail.com');
        }
      } catch(err) {
        btn.textContent = 'Try Again';
        btn.disabled = false;
        alert('Network error. Email us: carrolgarrett55@gmail.com');
      }
    });
  }

  // ── Fade-in animations ───────────────────────────────────────
  const fadeEls = document.querySelectorAll('.pain-card, .service-card, .step, .pricing-card, .stat, .lead-capture');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(el => observer.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // ── Stripe payment links ─────────────────────────────────────
  window.believeStripe = {
    church_audit:            'https://buy.stripe.com/fZu8wP6UR6Ge86T3hx43S11',
    community_growth_system: 'https://buy.stripe.com/dRm14n0wt0hQcn98BR43S12',
    full_church_ai_partner:  'https://buy.stripe.com/cNi3cva73e8G0Er05l43S13',
  };

});
