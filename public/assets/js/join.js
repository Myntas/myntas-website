// /join waitlist page and /join/confirmed: renders the copy from /join/copy.js, shows the fields for the chosen role,
// posts to /api/join (functions/api/join.js, which writes the contact to Brevo with double opt-in) and swaps the form
// for the thank-you state with the founder video. ?src=<event> tags the signup with the event it came from.
import { COPY, CONFIG } from '/join/copy.js';

const params = new URLSearchParams(location.search);
const lang = COPY[params.get('lang')] ? params.get('lang') : 'en';
const T = COPY[lang];
const SRC_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;
const src = SRC_RE.test((params.get('src') || '').toLowerCase()) ? params.get('src').toLowerCase() : 'web';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

document.documentElement.lang = lang;
document.title = document.body.dataset.view === 'confirmed' ? T.confirmedTitle.replace(/\.$/, '') + ' · Myntas' : T.title;
// trusted copy from copy.js (may hold <em> and links); everything typed by visitors is escaped
for (const el of document.querySelectorAll('[data-c]')) el.innerHTML = T[el.dataset.c].replace('{privacy}', CONFIG.links.privacy);
for (const el of document.querySelectorAll('[data-href]')) el.href = CONFIG.links[el.dataset.href];

function video(fig, file, { teaser = false, title = '' } = {}) {
  if (!fig) return;
  if (!file) {
    fig.innerHTML = `<img src="${CONFIG.video.poster}" alt="" width="640" height="640" loading="lazy">${teaser ? '' : `<figcaption>${esc(T.videoSoon)}</figcaption>`}`;
    fig.classList.add('is-poster');
    return;
  }
  fig.innerHTML = teaser
    ? `<video src="${file}" poster="${CONFIG.video.poster}" autoplay muted loop playsinline preload="metadata" aria-label="${esc(T.videoTeaserLabel)}"></video>`
    : `<video src="${file}" poster="${CONFIG.video.poster}" controls playsinline preload="metadata" aria-label="${esc(title)}"></video>`;
}
function links() {
  return [CONFIG.links.linkedin && `<a class="btn ghost" href="${CONFIG.links.linkedin}" target="_blank" rel="noopener">${esc(T.followLinkedin)}</a>`,
    `<a class="btn ghost" href="${CONFIG.links.website}">${esc(T.visitWebsite)}</a>`].filter(Boolean).join('');
}

if (document.body.dataset.view === 'confirmed') {
  document.getElementById('joinLinks').innerHTML = links();
  video(document.getElementById('fullVideo'), CONFIG.video.full, { title: T.thanksVideoTitle });
} else {
  video(document.getElementById('teaser'), CONFIG.video.teaser, { teaser: true });
  renderForm();
}

function countryOptions() {
  let names;
  try { names = new Intl.DisplayNames([lang], { type: 'region' }); } catch (e) { names = { of: c => c }; }
  const all = 'AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BG BH BO BR BS BY BZ CA CH CL CN CO CR CU CY CZ DE DK DO DZ EC EE EG ES ET FI FR GB GE GH GR GT HK HN HR HU ID IE IL IN IQ IR IS IT JM JO JP KE KR KW KZ LB LI LK LT LU LV MA MC MD ME MK MT MU MX MY NG NI NL NO NP NZ OM PA PE PH PK PL PR PT PY QA RO RS RU SA SE SG SI SK SM SN SV TH TN TR TT TW TZ UA UG US UY UZ VA VE VN ZA'.split(' ');
  const opt = c => `<option value="${c}">${esc(names.of(c) || c)}</option>`;
  const rest = all.filter(c => !CONFIG.topCountries.includes(c)).sort((a, b) => (names.of(a) || a).localeCompare(names.of(b) || b, lang));
  return CONFIG.topCountries.map(opt).join('') + '<option disabled>──────────</option>' + rest.map(opt).join('') + `<option value="OTHER">${lang === 'it' ? 'Altro' : 'Other'}</option>`;
}
function choices(name, map) {
  return Object.entries(map).map(([v, label]) => `<label class="jchip"><input type="radio" name="${name}" value="${v}"><span>${esc(label)}</span></label>`).join('');
}

function renderForm() {
  const box = document.getElementById('joinBox');
  box.innerHTML = `
  <form id="joinForm" class="join-form" novalidate>
    <div class="join-form-head"><h2 id="formT">${esc(T.formTitle)}</h2><p>${esc(T.formIntro)}</p></div>
    <div class="jrow">
      <label class="jfield"><span>${esc(T.firstName)}</span><input name="firstName" autocomplete="given-name" required maxlength="80"></label>
      <label class="jfield"><span>${esc(T.lastName)}</span><input name="lastName" autocomplete="family-name" required maxlength="80"></label>
    </div>
    <label class="jfield"><span>${esc(T.email)}</span><input name="email" type="email" autocomplete="email" inputmode="email" required maxlength="160"></label>
    <label class="jfield"><span>${esc(T.country)}</span><select name="country" autocomplete="country" required><option value="">${esc(T.countryPlaceholder)}</option>${countryOptions()}</select></label>
    <fieldset class="jset"><legend>${esc(T.role)}</legend><div class="jchips jchips-col">${choices('role', T.roles)}</div></fieldset>
    <div class="jmore" data-for="token_investor" hidden>
      <p class="jnote">${esc(T.researchNote)}</p>
      <fieldset class="jset"><legend>${esc(T.likelihood)} <i>${esc(T.optional)}</i></legend><div class="jchips">${choices('likelihood', T.likelihoods)}</div></fieldset>
      <fieldset class="jset"><legend>${esc(T.ticket)} <i>${esc(T.optional)}</i></legend><div class="jchips">${choices('ticket', T.tickets)}</div></fieldset>
      <fieldset class="jset"><legend>${esc(T.priority)} <i>${esc(T.optional)}</i></legend><div class="jchips">${choices('priority', T.priorities)}</div></fieldset>
    </div>
    <label class="jfield jmore" data-for="token_investor company_investor" hidden><span>${esc(T.linkedin)} <i>${esc(T.optional)}</i></span><input name="linkedin" type="url" inputmode="url" placeholder="${esc(T.linkedinPlaceholder)}" maxlength="200"></label>
    <label class="jhp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
    <label class="check"><input type="checkbox" name="consentUpdates" required> <span>${esc(T.consentUpdates)}</span></label>
    <label class="check"><input type="checkbox" name="consentNewsletter"> <span>${esc(T.consentNewsletter)}</span></label>
    <p class="jsmall">${T.privacyNote.replace('{privacy}', CONFIG.links.privacy)}</p>
    <div id="turnstile" class="jcaptcha"></div>
    <div class="count" id="joinErr" aria-live="polite"></div>
    <button type="submit" class="btn primary jsubmit">${esc(T.submit)}</button>
  </form>`;
  const form = document.getElementById('joinForm'), err = document.getElementById('joinErr');

  form.addEventListener('change', e => {
    if (e.target.name !== 'role') return;
    for (const el of form.querySelectorAll('.jmore')) {
      const on = el.dataset.for.split(' ').includes(e.target.value);
      el.hidden = !on;
      if (!on) for (const i of el.querySelectorAll('input')) { if (i.type === 'radio') i.checked = false; else i.value = ''; }
    }
  });

  let captcha = '';
  if (CONFIG.turnstileSiteKey) {
    window.onTurnstile = () => window.turnstile.render('#turnstile', { sitekey: CONFIG.turnstileSiteKey, theme: 'light', callback: t => { captcha = t; }, 'expired-callback': () => { captcha = ''; } });
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstile';
    s.async = true; document.head.append(s);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(form), v = k => (f.get(k) || '').toString().trim();
    const missing = ['firstName', 'lastName', 'email', 'country'].find(k => !v(k)) || (!v('role') && 'role');
    if (missing) { err.textContent = T.errRequired; (form.elements[missing][0] || form.elements[missing]).focus(); return; }
    if (!EMAIL_RE.test(v('email'))) { err.textContent = T.errEmail; form.elements.email.focus(); return; }
    if (!f.get('consentUpdates')) { err.textContent = T.errConsent; return; }
    if (CONFIG.turnstileSiteKey && !captcha) { err.textContent = T.errCaptcha; return; }
    err.textContent = '';
    const btn = form.querySelector('.jsubmit');
    btn.disabled = true; btn.textContent = T.sending;
    const data = { firstName: v('firstName'), lastName: v('lastName'), email: v('email'), country: v('country'), role: v('role'),
      likelihood: v('likelihood'), ticket: v('ticket'), priority: v('priority'), linkedin: v('linkedin'), website: v('website'),
      consentUpdates: true, consentNewsletter: !!f.get('consentNewsletter'), src, lang, signupAt: new Date().toISOString(), captcha };
    let ok = false;
    try {
      const res = await fetch('/api/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      ok = res.ok;
      if (!ok && (await res.json().catch(() => ({}))).error === 'captcha') { err.textContent = T.errCaptcha; window.turnstile?.reset(); captcha = ''; }
      else if (!ok) err.textContent = T.errServer;
    } catch (x) { err.textContent = T.errServer; }
    if (!ok) { btn.disabled = false; btn.textContent = T.submit; return; }
    thanks();
  });
}

function thanks() {
  const box = document.getElementById('joinBox');
  box.innerHTML = `<div class="join-thanks" role="status" tabindex="-1">
    <h2>${esc(T.thanksTitle)}</h2><p>${esc(T.thanksText)}</p>
    <h3>${esc(T.thanksVideoTitle)}</h3><figure class="join-media" id="fullVideo"></figure>
    <div class="join-links">${links()}</div></div>`;
  video(document.getElementById('fullVideo'), CONFIG.video.full, { title: T.thanksVideoTitle });
  const teaser = document.getElementById('teaser');
  if (teaser) teaser.hidden = true;
  box.firstElementChild.focus();
  box.scrollIntoView({ block: 'start', behavior: 'smooth' });
}
