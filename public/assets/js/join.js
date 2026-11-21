// /join waitlist page and /join/confirmed: renders the copy from /join/copy.js, shows the fields for the chosen role,
// posts to /api/join (functions/api/join.js, which writes the contact to Brevo with double opt-in) and swaps the form
// for the thank-you state with the founder video. ?src=<event> tags the signup with the event it came from.
import { COPY, CONFIG } from '/join/copy.js';
import { makeCard } from '/assets/js/join-card.js';
import { mapUrl } from '/assets/js/join-pick.js';

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
function choices(name, map, type = 'radio') {
  return Object.entries(map).map(([v, label]) => `<label class="jchip"><input type="${type}" name="${name}" value="${v}"><span>${esc(label)}</span></label>`).join('');
}

function renderForm() {
  const box = document.getElementById('joinBox');
  box.innerHTML = `
  <form id="joinForm" class="join-form" novalidate>
    <div class="join-form-head"><h2 id="formT">${esc(T.formTitle)}</h2><p>${esc(T.formIntro)}</p></div>
    <div class="jrow">
      <label class="jfield"><span>${esc(T.firstName)} <b class="jreq" aria-hidden="true">*</b></span><input name="firstName" autocomplete="given-name" required maxlength="80"></label>
      <label class="jfield"><span>${esc(T.lastName)} <b class="jreq" aria-hidden="true">*</b></span><input name="lastName" autocomplete="family-name" required maxlength="80"></label>
    </div>
    <label class="jfield"><span>${esc(T.email)} <b class="jreq" aria-hidden="true">*</b></span><input name="email" type="email" autocomplete="email" inputmode="email" required maxlength="160"></label>
    <label class="jfield"><span>${esc(T.country)} <b class="jreq" aria-hidden="true">*</b></span><select name="country" autocomplete="country" required><option value="">${esc(T.countryPlaceholder)}</option>${countryOptions()}</select></label>
    <fieldset class="jset"><legend>${esc(T.role)} <b class="jreq" aria-hidden="true">*</b> <i>${esc(T.roleMulti)}</i></legend><div class="jchips jchips-col">${choices('role', T.roles, 'checkbox')}</div></fieldset>
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

  // more than one role can be picked: each extra block shows while any of its roles is ticked
  form.addEventListener('change', e => {
    if (e.target.name !== 'role') return;
    const picked = new FormData(form).getAll('role');
    for (const el of form.querySelectorAll('.jmore')) {
      const on = el.dataset.for.split(' ').some(r => picked.includes(r));
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
    const data = { firstName: v('firstName'), lastName: v('lastName'), email: v('email'), country: v('country'), role: f.getAll('role'),
      likelihood: v('likelihood'), ticket: v('ticket'), priority: v('priority'), linkedin: v('linkedin'), website: v('website'),
      consentUpdates: true, consentNewsletter: !!f.get('consentNewsletter'), src, lang, signupAt: new Date().toISOString(), captcha };
    let ok = false;
    if (CONFIG.testMode) ok = true; // preview: nothing is sent
    else try {
      const res = await fetch('/api/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      ok = res.ok;
      if (!ok && (await res.json().catch(() => ({}))).error === 'captcha') { err.textContent = T.errCaptcha; window.turnstile?.reset(); captcha = ''; }
      else if (!ok) err.textContent = T.errServer;
    } catch (x) { err.textContent = T.errServer; }
    if (!ok) { btn.disabled = false; btn.textContent = T.submit; return; }
    thanks(data);
  });
}

function thanks(data) {
  const box = document.getElementById('joinBox');
  box.innerHTML = `<div class="join-thanks" role="status" tabindex="-1">
    <h2>${esc(T.thanksTitle)}</h2><p>${esc(CONFIG.testMode ? T.thanksTextTest : T.thanksText)}</p><p class="jperk-note">${esc(T.thanksPerks)}</p>
    <div class="jcard-wrap sealed" id="cardWrap"><h3>${esc(T.cardTitle)}</h3>
      <button type="button" class="btn primary jreveal-btn" id="revealBtn">${esc(T.revealBtn)}</button>
      <div class="jstage">
        <button type="button" class="jtoken" id="token" aria-label="${esc(T.revealBtn)}"><img src="/assets/img/join-token-glass.webp" alt="" width="471" height="522"><canvas></canvas></button>
        <button type="button" class="jcard" id="card" aria-label="${esc(T.cardFlip)}" tabindex="-1"><span class="jcard-tilt"><span class="jcard-in">
          <span class="jcard-face jcard-front"><img id="cardImg" alt=""><span class="jcard-glare"></span></span>
          <span class="jcard-face jcard-back" id="cardBack"><img src="/assets/img/logo.svg" alt=""><span class="jcard-glare"></span></span>
        </span></span></button>
      </div>
      <p class="jcard-note">${esc(T.cardDisclaimer)}</p><div class="join-links" id="cardActions"></div><div class="jshares" id="cardShare"></div></div>
    <h3>${esc(T.thanksVideoTitle)}</h3><figure class="join-media" id="fullVideo"></figure>
    <div class="join-links">${links()}</div></div>`;
  video(document.getElementById('fullVideo'), CONFIG.video.full, { title: T.thanksVideoTitle });
  const teaser = document.getElementById('teaser');
  if (teaser) teaser.hidden = true;
  box.firstElementChild.focus();
  box.scrollIntoView({ block: 'start', behavior: 'smooth' });
  sealed();
  showCard(data).catch(e => console.error(e));
}

// the reward: a founding collector card with a famous landmark, revealed with a flip, then saved or shared as a PNG
async function showCard(data) {
  const { canvas, landmark: lm, piece } = await makeCard({ email: data.email, name: `${data.firstName} ${data.lastName}`, src: data.src, T, landmarks: CONFIG.landmarks, odds: CONFIG.cardClasses });
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  const url = URL.createObjectURL(blob), file = `myntas-collector-${lm.id}-${piece}.png`;
  const img = document.getElementById('cardImg');
  img.src = url; img.alt = `${T.cardKicker}: ${lm.name}, ${lm.city}, #${piece}`;
  const map = mapUrl(lm);
  const actions = document.getElementById('cardActions');
  actions.innerHTML = `<a class="btn primary" href="${map}" target="_blank" rel="noopener">${esc(T.cardMap)}</a><a class="btn ghost" href="${url}" download="${file}">${esc(T.cardSave)}</a>`;
  // Apple Wallet (Apple devices): a form POST, so the email stays out of the URL. Until the pass certificate is set up
  // (CONFIG.appleWallet false) the button explains that it is coming soon instead of posting
  if (/iPhone|iPad|Macintosh/.test(navigator.userAgent)) {
    const w = document.createElement('form'); w.method = 'post'; w.action = '/api/wallet'; w.className = 'jwallet';
    for (const [k, v] of Object.entries({ email: data.email, name: `${data.firstName} ${data.lastName}`, src: data.src, lang })) { const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = v; w.append(i); }
    w.insertAdjacentHTML('beforeend', `<button type="submit" class="btn jwallet-btn"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 9.5h18M15 14h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>${esc(T.cardWallet)}</button><p class="jwallet-soon" hidden>${esc(T.cardWalletSoon)}</p>`);
    if (!CONFIG.appleWallet) w.addEventListener('submit', e => { e.preventDefault(); w.querySelector('.jwallet-soon').hidden = false; });
    actions.append(w);
  }
  const shareFile = new File([blob], file, { type: 'image/png' });
  if (navigator.canShare?.({ files: [shareFile] })) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ghost'; b.textContent = T.cardShare;
    b.onclick = () => navigator.share({ files: [shareFile], title: `Myntas · ${lm.name}` }).catch(() => {});
    actions.append(b);
  }
  // share: each place has its own page (/join/card/<id>/) whose preview shows the card, then sends people to /join
  const page = `https://www.myntas.com/join/card/${lm.id}/`, rarity = T.cardClass[lm.cls][1].toLowerCase();
  const fill = t => t.replace('{name}', lm.name).replace('{piece}', piece).replace('{rarity}', rarity);
  const long = fill(T.shareText), short = fill(T.shareTextShort);
  const enc = encodeURIComponent;
  const icon = (href, label, path) => `<a class="jshare" href="${href}" target="_blank" rel="noopener" aria-label="${esc(label)}" title="${esc(label)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg></a>`;
  document.getElementById('cardShare').innerHTML = `<span>${esc(T.shareTitle)}</span>` + [
    icon(`https://www.linkedin.com/feed/?shareActive=true&text=${enc(long.replace('@Myntas', 'Myntas') + ' ' + page)}`, T.shareLinkedin, ICONS.linkedin),
    icon(`https://wa.me/?text=${enc(short + ' ' + page)}`, T.shareWhatsapp, ICONS.whatsapp),
    icon(`https://twitter.com/intent/tweet?text=${enc(short)}&url=${enc(page)}`, T.shareX, ICONS.x),
    icon(`https://www.facebook.com/sharer/sharer.php?u=${enc(page)}`, T.shareFacebook, ICONS.facebook),
    icon(`https://t.me/share/url?url=${enc(page)}&text=${enc(short)}`, T.shareTelegram, ICONS.telegram),
    icon(`mailto:?subject=${enc(`Myntas · ${lm.name}`)}&body=${enc(short + ' ' + page)}`, T.shareEmail, ICONS.email)
  ].join('');
  const [cls, rarity2] = T.cardClass[lm.cls];
  document.getElementById('cardBack').insertAdjacentHTML('beforeend', `<span class="jb-kick">${esc(T.cardKicker)}</span>
    <span class="jb-name">${esc(lm.name)}</span><span class="jb-city">${esc(lm.city)}</span>
    <span class="jb-row"><b>#${String(piece).padStart(4, '0')}</b> / 1000</span><span class="jb-cls">${esc(cls)} · ${esc(rarity2)}</span>
    ${lm.lat != null ? `<span class="jb-geo">${coord(lm.lat, 'N', 'S')} · ${coord(lm.lng, 'E', 'W')}</span>` : ''}`);
  await img.decode().catch(() => {});
  ready();
}

// the reveal: the floating token waits with a "click here" button; a click spins it until it turns edge-on,
// then the card carries on the same turn, back first, and lands on its front
let ready;
const cardReady = new Promise(r => { ready = r; });
function sealed() {
  const wrap = document.getElementById('cardWrap'), token = document.getElementById('token'), card = document.getElementById('card');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the live glass token (as on the home); the still image stays if WebGL or three.js are not available
  const live = import('/assets/js/join-token.js').then(m => m.mountToken(token.querySelector('canvas'))).then(t => { token.classList.add('live'); return t; }).catch(() => null);
  let busy = false;
  const open = async () => {
    if (busy) return; busy = true;
    document.getElementById('revealBtn').disabled = true;
    const t = await live;
    wrap.classList.add('spinning');
    await Promise.all([cardReady, t ? t.spin() : new Promise(r => setTimeout(r, still ? 0 : 1100))]);
    wrap.classList.remove('sealed', 'spinning'); wrap.classList.add('pre');
    token.hidden = true; card.tabIndex = 0;
    card.getBoundingClientRect(); // commit the edge-on start before the turn
    requestAnimationFrame(() => { wrap.classList.remove('pre'); wrap.classList.add('flipped'); interactive(card, wrap); });
  };
  token.addEventListener('click', open);
  document.getElementById('revealBtn').addEventListener('click', open);
}

// share icons (24px paths: Simple Icons, CC0; the envelope is ours). Plain links: nothing from these services loads
const ICONS = {
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452z',
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z',
  x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z',
  facebook: 'M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z',
  telegram: 'M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z',
  email: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm.8 2v.3l8.2 5.6 8.2-5.6V7zm16.4 2.6-7.64 5.22a1 1 0 0 1-1.12 0L3.8 9.6V17h16.4z'
};

const coord = (v, pos, neg) => `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`;

// the card follows the finger or the pointer (tilt and a moving light), and a tap or click turns it over
function interactive(card, wrap) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let moved = false, sx = 0, sy = 0;
  const tilt = e => {
    if (still) return;
    const r = card.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    card.style.setProperty('--ry', `${(x - 0.5) * 24}deg`); card.style.setProperty('--rx', `${(0.5 - y) * 24}deg`);
    card.style.setProperty('--gx', `${x * 100}%`); card.style.setProperty('--gy', `${y * 100}%`);
    card.classList.add('tilting');
  };
  const rest = () => { card.classList.remove('tilting'); card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); };
  card.addEventListener('pointerdown', e => { moved = false; sx = e.clientX; sy = e.clientY; tilt(e); });
  card.addEventListener('pointermove', e => { if (Math.hypot(e.clientX - sx, e.clientY - sy) > 8) moved = true; tilt(e); });
  card.addEventListener('pointerleave', rest); card.addEventListener('pointercancel', rest);
  card.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') rest(); });
  card.addEventListener('click', () => { if (moved) { moved = false; return; } wrap.classList.toggle('flipped'); });
}
