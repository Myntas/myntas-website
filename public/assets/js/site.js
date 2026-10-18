// Shared behaviour: in-page scroll buttons, the home investor/owner switch, email sign-ups and lead forms (owner proposals, reservations, waitlist).
// Forms post JSON to /api/lead. Until that endpoint exists the visitor sees a message with the email address instead.

export const CONTACT_EMAIL = 'info@myntas.com';
export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function submitLead(kind, data) {
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, ...data, page: location.pathname, sentAt: new Date().toISOString() })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export function fallbackHTML(summary) {
  return `<div class="fallback-msg" role="status"><b>L'invio online non è ancora attivo.</b><span>Scrivici a <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> e riporta questi dati:</span><span>${esc(summary)}</span></div>`;
}

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
document.addEventListener('click', e => {
  const b = e.target.closest('button[data-scroll]');
  if (!b) return;
  const el = document.getElementById(b.dataset.scroll);
  if (el) el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
});

// investor/owner switch (home benefits): swaps the card panels and sets data-side, which scene.js reads to flip the token
for (const list of document.querySelectorAll('.switch[role="tablist"]')) {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const host = list.closest('.perks');
  const select = (tab, focus) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    }
    if (host) host.dataset.side = tab.dataset.side;
    if (focus) tab.focus();
  };
  list.addEventListener('click', e => { const t = e.target.closest('[role="tab"]'); if (t) select(t); });
  list.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key], i = tabs.indexOf(document.activeElement);
    if (!d || i < 0) return;
    e.preventDefault();
    select(tabs[(i + d + tabs.length) % tabs.length], true);
  });
}

// email sign-ups: footer newsletter (every page), new-offer alerts (home band), AUREA early access. <form data-signup="kind">
// Named fields other than the email and the consent box (name, profile) are sent along.
const SIGNUP = {
  it: { email: 'Inserisci un indirizzo email valido.', consent: 'Serve il consenso per iscriverti.', required: 'Compila i campi obbligatori (*).',
    newsletter: ['Iscrizione completata', 'Grazie. Ti scriveremo quando ci sono novità.'],
    alerts: ['Fatto', 'Ti avviseremo quando apre una nuova offerta.'],
    'early-access': ['Richiesta ricevuta', 'Grazie. Ti scriveremo appena AUREA apre le prime offerte.'] },
  en: { email: 'Enter a valid email address.', consent: 'Please tick the box to subscribe.', required: 'Fill in the required fields (*).',
    newsletter: ['You are subscribed', 'Thank you. We will write when there is news.'],
    alerts: ['Done', 'We will let you know when a new offering opens.'],
    'early-access': ['Request received', 'Thank you. We will write as soon as AUREA opens its first offerings.'],
    fallback: `<div class="fallback-msg" role="status"><b>Online sign-up is not active yet.</b><span>Email us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> and we will add you to the list.</span></div>` }
};
const SIGNUP_LABEL = { newsletter: 'newsletter', alerts: 'avvisi nuove offerte', 'early-access': 'accesso anticipato AUREA' };
for (const form of document.querySelectorAll('form[data-signup]')) {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'it', T = SIGNUP[lang], kind = form.dataset.signup;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]'), email = input.value.trim();
    const err = form.querySelector('.count');
    const extra = [...form.querySelectorAll('input[name], select[name]')].filter(el => el !== input && el.type !== 'checkbox');
    const missing = extra.find(el => el.required && !el.value.trim());
    if (missing) { err.textContent = T.required; missing.focus(); return; }
    if (!EMAIL_RE.test(email)) { err.textContent = T.email; input.focus(); return; }
    if (!form.querySelector('input[name="consent"]').checked) { err.textContent = T.consent; return; }
    err.textContent = '';
    form.querySelector('button[type="submit"]').disabled = true;
    const data = Object.fromEntries(extra.map(el => [el.name, el.value.trim()]));
    const ok = await submitLead(kind, { email, lang, ...data });
    form.innerHTML = ok
      ? `<div class="done-msg" role="status"><b>${T[kind][0]}</b><span>${T[kind][1]}</span></div>`
      : T.fallback || fallbackHTML(`Iscrizione ${SIGNUP_LABEL[kind] || kind}: ${email}${data.name ? ', ' + data.name : ''}${data.profile ? ' (' + data.profile + ')' : ''}`);
  });
}

// owner tokenization request (/proprietari/ and /en/proprietari/)
const owner = document.getElementById('ownerFormEl');
if (owner) {
  const en = document.documentElement.lang === 'en';
  const M = en
    ? { required: 'Fill in the required fields (*).', email: 'Enter a valid email address.', consent: 'We need your consent to contact you.', sending: 'Sending…',
        done: ['Request sent', 'Thank you. The team will review the details and reply with an initial assessment.'],
        fallback: `<div class="fallback-msg" role="status"><b>Online sending is not active yet.</b><span>Email us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> with the details of your property.</span></div>` }
    : { required: 'Compila i campi obbligatori (*).', email: 'Inserisci un indirizzo email valido.', consent: 'Serve il consenso per poterti ricontattare.', sending: 'Invio in corso…',
        done: ['Richiesta inviata', 'Grazie. Il team valuta i dati e ti risponde con una prima valutazione.'] };
  owner.addEventListener('submit', async e => {
    e.preventDefault();
    const val = id => document.getElementById(id).value.trim();
    const err = document.getElementById('ownerErr');
    const req = ['oName', 'oEmail', 'oType', 'oCity', 'oValue', 'oLet', 'oShare'];
    const miss = req.filter(id => !val(id));
    if (miss.length) { err.textContent = M.required; document.getElementById(miss[0]).focus(); return; }
    if (!EMAIL_RE.test(val('oEmail'))) { err.textContent = M.email; document.getElementById('oEmail').focus(); return; }
    if (!document.getElementById('oConsent').checked) { err.textContent = M.consent; return; }
    err.textContent = '';
    const btn = owner.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = M.sending;
    const data = { name: val('oName'), company: val('oCompany'), email: val('oEmail'), phone: val('oPhone'), type: val('oType'), city: val('oCity'), value: val('oValue'), let: val('oLet'), share: val('oShare'), description: val('oDesc'), lang: en ? 'en' : 'it' };
    const ok = await submitLead('owner', data);
    owner.innerHTML = ok
      ? `<div class="done-msg" role="status"><b>${M.done[0]}</b><span>${M.done[1]}</span></div>`
      : M.fallback || fallbackHTML(`Richiesta di tokenizzazione: ${data.type}, ${data.city}, valore ${data.value}, locato: ${data.let}, quota: ${data.share}.`);
  });
}
