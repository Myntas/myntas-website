// Shared behaviour: in-page scroll buttons, the home investor/owner switch, the footer newsletter and lead forms (owner proposals, reservations, waitlist).
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

// newsletter sign-up (footer, every page)
const news = document.getElementById('newsForm');
if (news) {
  const en = document.documentElement.lang === 'en';
  const T = en
    ? { email: 'Enter a valid email address.', consent: 'Please tick the box to subscribe.', done: 'You are subscribed', doneSub: 'Thank you. We will write when there is news.',
        fallback: `<div class="fallback-msg" role="status"><b>Online sign-up is not active yet.</b><span>Email us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> and we will add you to the list.</span></div>` }
    : { email: 'Inserisci un indirizzo email valido.', consent: 'Serve il consenso per iscriverti.', done: 'Iscrizione completata', doneSub: 'Grazie. Ti scriveremo quando ci sono novità.' };
  news.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('newsEmail').value.trim();
    const err = document.getElementById('newsErr');
    if (!EMAIL_RE.test(email)) { err.textContent = T.email; document.getElementById('newsEmail').focus(); return; }
    if (!document.getElementById('newsConsent').checked) { err.textContent = T.consent; return; }
    err.textContent = '';
    news.querySelector('button[type="submit"]').disabled = true;
    const ok = await submitLead('newsletter', { email, lang: en ? 'en' : 'it' });
    news.innerHTML = ok
      ? `<div class="done-msg" role="status"><b>${T.done}</b><span>${T.doneSub}</span></div>`
      : T.fallback || fallbackHTML(`Iscrizione newsletter: ${email}`);
  });
}

// owner proposal form (/proprietari/)
const owner = document.getElementById('ownerFormEl');
if (owner) {
  owner.addEventListener('submit', async e => {
    e.preventDefault();
    const val = id => document.getElementById(id).value.trim();
    const err = document.getElementById('ownerErr');
    const req = ['oName', 'oEmail', 'oType', 'oCity', 'oValue', 'oLet'];
    const miss = req.filter(id => !val(id));
    if (miss.length) { err.textContent = 'Compila i campi obbligatori (*).'; document.getElementById(miss[0]).focus(); return; }
    if (!EMAIL_RE.test(val('oEmail'))) { err.textContent = 'Inserisci un indirizzo email valido.'; document.getElementById('oEmail').focus(); return; }
    if (!document.getElementById('oConsent').checked) { err.textContent = 'Serve il consenso per poterti ricontattare.'; return; }
    err.textContent = '';
    const btn = owner.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Invio in corso…';
    const data = { name: val('oName'), company: val('oCompany'), email: val('oEmail'), phone: val('oPhone'), type: val('oType'), city: val('oCity'), value: val('oValue'), let: val('oLet'), description: val('oDesc') };
    const ok = await submitLead('owner', data);
    owner.innerHTML = ok
      ? `<div class="done-msg" role="status"><b>Proposta inviata</b><span>Grazie. Il team valuta i dati e ti risponde con una prima valutazione.</span></div>`
      : fallbackHTML(`Proposta immobile: ${data.type}, ${data.city}, valore ${data.value}, locato: ${data.let}.`);
  });
}
