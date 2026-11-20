/* Thrustra /launch — personalized go-live page.
   Personalize with ?for=: thrustra.com/launch/?for=antonio (a #antonio hash also works)
   Add a prospect by adding an entry below. Expiry is the date the preview link comes down (ISO). */
(function () {
  'use strict';

  var PROSPECTS = {
    antonio:  { name: "Antonio's Construction",   preview: 'https://kc2flycodes.github.io/ANTONIO/', expires: '2026-12-04' },
    oxendine: { name: 'Oxendine & Son Roofing',     preview: 'https://kc2flycodes.github.io/OS/',      expires: '2026-12-04' },
    sws:      { name: 'Sam W. Smith Inc.',          preview: 'https://kc2flycodes.github.io/SWS/',     expires: '2026-12-04' },
    exotic:   { name: 'Exotic Smoke Shop',          preview: 'https://kc2flycodes.github.io/EXOTIC/',  expires: '2026-12-04' }
  };
  var ENDPOINT = 'https://formspree.io/f/mdayqzrd';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var qs = (location.search.match(/[?&]for=([\w-]+)/) || [])[1];
  var slug = (qs || (location.hash || '').replace('#', '')).toLowerCase().trim();
  var p = PROSPECTS[slug];
  window.addEventListener('hashchange', function () {
    var h = location.hash.replace('#', '').toLowerCase();
    if (PROSPECTS[h] && h !== slug) location.reload();
  });

  if (p) {
    var exp = new Date(p.expires + 'T23:59:00');
    var expTxt = exp.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    $$('[data-p-name]').forEach(function (el) { el.textContent = p.name; });
    $$('[data-p-preview]').forEach(function (el) { el.href = p.preview; });
    $$('[data-p-exp]').forEach(function (el) { el.textContent = expTxt; });
    $('#heroGeneric').hidden = true;
    $('#heroPersonal').hidden = false;
    $('#cardGeneric').hidden = true;
    $('#cardPersonal').hidden = false;
    var biz = $('#f-biz'); if (biz) biz.value = p.name;
    document.title = p.name + ' · Turn it on | Thrustra';
    if (Date.now() > exp.getTime()) {
      $('#cardPersonal .expiry').textContent = 'This preview has expired. Ask Karim to put it back up.';
    }
  }

  /* plan preselect */
  $$('[data-plan]').forEach(function (b) {
    b.addEventListener('click', function () {
      var r = $('input[name="Plan"][value="' + b.getAttribute('data-plan') + '"]');
      if (r) r.checked = true;
    });
  });

  /* form */
  var form = $('#goForm');
  if (form) {
    var err = $('.form-err', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('[required]', form).forEach(function (f) {
        if (f.type === 'radio') { if (!$('input[name="' + f.name + '"]:checked', form)) ok = false; }
        else if (!f.checkValidity()) ok = false;
      });
      if (!ok) { err.textContent = 'Fill in the required fields.'; return; }
      err.textContent = '';
      var btn = $('[type=submit]', form);
      btn.disabled = true; btn.textContent = 'Sending…';
      var fd = new FormData(form);
      fd.append('_subject', '[LAUNCH · ' + String(fd.get('Plan') || '').toUpperCase() + '] ' + (fd.get('Business') || ''));
      fd.append('Source', slug ? 'launch#' + slug : 'launch');
      fetch(ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error('bad'); })
        .then(function () {
          form.querySelector('.form-body').hidden = true;
          $('.done', form).classList.add('on');
          if (window.gtag) window.gtag('event', 'generate_lead', { form: 'launch', plan: fd.get('Plan'), prospect: slug || 'none' });
        })
        .catch(function () {
          err.innerHTML = 'That didn’t send. Call or text Karim at <a href="tel:+17034777408">703-477-7408</a>.';
          btn.disabled = false; btn.textContent = 'Turn it on';
        });
    });
  }

  var y = $('#yr'); if (y) y.textContent = new Date().getFullYear();
})();
