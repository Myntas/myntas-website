// Shared behaviour: in-page scroll buttons and lead forms (owner proposals, reservations, waitlist).
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
