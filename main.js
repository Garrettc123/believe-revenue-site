// BELIEVE — Church AI Systems
// Main JS: Nav scroll behavior + smooth anchors + CTA tracking

document.addEventListener('DOMContentLoaded', () => {

  // Nav scroll effect
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  });

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // CTA click tracking (console log — replace with analytics pixel when ready)
  document.querySelectorAll('.btn-primary, .btn-outline, .btn-ghost').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.textContent.trim();
      const href = btn.getAttribute('href') || '';
      console.log('[BELIEVE] CTA clicked:', label, href);
      // TODO: replace with Meta Pixel or GA4 event
      // fbq('track', 'Lead');
      // gtag('event', 'conversion', { send_to: 'AW-XXXXXXXX/YYYYYY' });
    });
  });

  // Intersection Observer for fade-in animations
  const fadeEls = document.querySelectorAll('.pain-card, .service-card, .step, .pricing-card, .stat');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(el => observer.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // Stripe payment links — church pricing tiers
  const stripeLinks = {
    church_audit:              'https://buy.stripe.com/fZu8wP6UR6Ge86T3hx43S11',
    community_growth_system:   'https://buy.stripe.com/dRm14n0wt0hQcn98BR43S12',
    full_church_ai_partner:    'https://buy.stripe.com/cNi3cva73e8G0Er05l43S13',
  };

  window.believeStripe = stripeLinks;
});
