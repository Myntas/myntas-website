// AUREA marketplace: listings, filters, property sheet and reservation.
// PROPERTIES BELOW ARE EXAMPLES. Replace them with real offerings (and their documents) before launch.
import { submitLead, fallbackHTML, EMAIL_RE, esc } from '/assets/js/site.js';

const PROPS = [
  { id: 'solferino', name: 'Palazzo Solferino', city: 'Milano', area: 'Brera', street: 'Via Solferino', type: 'Residenziale', status: 'raccolta', value: 2400000, price: 100, supply: 24000, sold: 0.68, yield: 4.8, investors: 412, sqm: 1180, units: 9, occ: '100%', lease: '4+4 anni', energy: 'B', rent: 142000, year: 1908, floors: 5, bays: 5, arches: true, roof: 'cornice', close: '30 novembre 2026' },
  { id: 'santospirito', name: 'Residenze Santo Spirito', city: 'Firenze', area: 'Oltrarno', street: 'Via Maggio', type: 'Residenziale', status: 'raccolta', value: 1200000, price: 100, supply: 12000, sold: 0.41, yield: 5.2, investors: 186, sqm: 640, units: 6, occ: '100%', lease: '4+4 anni', energy: 'C', rent: 78000, year: 1870, floors: 4, bays: 4, arches: false, roof: 'pitched', close: '15 dicembre 2026' },
  { id: 'clavature', name: 'Bottega del Quadrilatero', city: 'Bologna', area: 'Quadrilatero', street: 'Via Clavature', type: 'Commerciale', status: 'raccolta', value: 950000, price: 100, supply: 9500, sold: 0.87, yield: 6.1, investors: 233, sqm: 380, units: 2, occ: '100%', lease: '6+6 anni', energy: 'D', rent: 71000, year: 1890, floors: 3, bays: 3, arches: true, roof: 'cornice', close: '10 novembre 2026' },
  { id: 'monti', name: 'Corte Monti', city: 'Roma', area: 'Rione Monti', street: 'Via Panisperna', type: 'Uso misto', status: 'presto', value: 1850000, price: 100, supply: 18500, sold: 0, yield: 5.0, investors: 0, sqm: 910, units: 7, occ: '86%', lease: 'Misto', energy: 'C', rent: 116000, year: 1885, floors: 4, bays: 5, arches: true, roof: 'pitched', close: 'Apertura a gennaio 2027' },
  { id: 'crocetta', name: 'Palazzina Crocetta', city: 'Torino', area: 'Crocetta', street: 'Corso Galileo Ferraris', type: 'Residenziale', status: 'presto', value: 1100000, price: 100, supply: 11000, sold: 0, yield: 4.9, investors: 0, sqm: 720, units: 8, occ: '100%', lease: '4+4 anni', energy: 'B', rent: 68000, year: 1925, floors: 5, bays: 4, arches: false, roof: 'cornice', close: 'Apertura a febbraio 2027' },
  { id: 'chiaia', name: 'Casa dei Mille', city: 'Napoli', area: 'Chiaia', street: 'Via dei Mille', type: 'Residenziale', status: 'chiuso', value: 780000, price: 100, supply: 7800, sold: 1, yield: 5.4, investors: 157, sqm: 410, units: 4, occ: '100%', lease: '4+4 anni', energy: 'C', rent: 51000, year: 1898, floors: 4, bays: 3, arches: true, roof: 'pitched', close: 'Raccolta completata' }
];
const byId = Object.fromEntries(PROPS.map(p => [p.id, p]));
const STATUS = { raccolta: ['In raccolta', 'live'], presto: ['Prossimamente', ''], chiuso: ['Completato', 'done'] };
const eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf = new Intl.NumberFormat('it-IT');
const pct = v => v.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
const mln = v => v >= 1e6 ? (v / 1e6).toLocaleString('it-IT', { maximumFractionDigits: 2 }) + ' mln €' : nf.format(Math.round(v / 1000)) + 'k €';

// facade illustration, drawn from each property's floors, bays, arches and roof
function facade(p, wide) {
  const W = wide ? 640 : 400, Hh = wide ? 360 : 300, ground = Hh - 38;
  const bay = 40, fh = 36;
  const bw = p.bays * bay + 40, bh = p.floors * fh + 18;
  const x0 = (W - bw) / 2, y0 = ground - bh;
  let s = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Illustrazione della facciata di ${esc(p.name)}">`;
  const sk = [[0.02, 0.42], [0.09, 0.58], [0.15, 0.36], [0.2, 0.5], [0.7, 0.44], [0.76, 0.62], [0.83, 0.4], [0.89, 0.52], [0.95, 0.34]];
  sk.forEach(([fx, fhh], i) => { const w = W * 0.07; const h = Hh * fhh * 0.7; s += `<rect x="${fx * W}" y="${ground - h}" width="${w}" height="${h}" fill="#d6c3a0" opacity="${i % 2 ? 0.28 : 0.4}"/>`; });
  s += `<rect x="0" y="${ground}" width="${W}" height="${Hh - ground}" fill="#3b2d19" opacity="0.06"/>`;
  if (p.roof === 'pitched') s += `<polygon points="${x0 - 8},${y0 + 6} ${x0 + bw / 2},${y0 - 30} ${x0 + bw + 8},${y0 + 6}" fill="#8a6a2b" opacity="0.85"/>`;
  s += `<rect x="${x0}" y="${y0}" width="${bw}" height="${bh}" fill="#dcc9a6"/>`;
  s += `<rect x="${x0 + bw - 8}" y="${y0}" width="8" height="${bh}" fill="#c9b48c"/>`;
  s += `<rect x="${x0 - 4}" y="${y0}" width="${bw + 8}" height="9" fill="#b79144"/>`;
  for (let f = 1; f < p.floors; f++) {
    const yy = ground - (f + 1) * fh + 14;
    s += `<rect x="${x0}" y="${ground - f * fh - 1}" width="${bw}" height="2" fill="#3b2d19" opacity="0.12"/>`;
    for (let b = 0; b < p.bays; b++) {
      const wx = x0 + 20 + b * bay + 10;
      s += `<rect x="${wx - 6}" y="${yy}" width="5" height="22" fill="#b79144" opacity="0.85"/><rect x="${wx}" y="${yy}" width="16" height="22" fill="#4a3820"/><rect x="${wx + 17}" y="${yy}" width="5" height="22" fill="#b79144" opacity="0.85"/>`;
      if (f === 1 && p.floors > 3) s += `<rect x="${wx - 3}" y="${yy + 22}" width="22" height="3" fill="#725920"/>`;
    }
  }
  for (let b = 0; b < p.bays; b++) {
    const ax = x0 + 20 + b * bay + 7, ay = ground - 30;
    if (p.arches) s += `<path d="M${ax} ${ground} V${ay + 12} A11 11 0 0 1 ${ax + 22} ${ay + 12} V${ground} Z" fill="#4a3820"/>`;
    else if (b === Math.floor(p.bays / 2)) s += `<rect x="${ax + 2}" y="${ay + 2}" width="18" height="28" fill="#4a3820"/><rect x="${ax + 2}" y="${ay}" width="18" height="3" fill="#b79144"/>`;
    else s += `<rect x="${ax + 3}" y="${ay + 6}" width="16" height="16" fill="#4a3820"/>`;
  }
  s += `<rect x="${x0}" y="${ground - 34}" width="${bw}" height="2" fill="#3b2d19" opacity="0.15"/>`;
  return s + '</svg>';
}

// listings
const filt = { city: '', type: '', status: '', sort: 'stato' };
function renderStats() {
  const live = PROPS.filter(p => p.status === 'raccolta').length;
  const cities = new Set(PROPS.map(p => p.city)).size;
  document.getElementById('aureaStats').innerHTML = `<span><b>${PROPS.length}</b> immobili</span><span><b>${cities}</b> città</span><span><b>${live}</b> in raccolta</span><span>da <b>100 €</b> per token</span>`;
}
function renderChips() {
  const cities = ['', ...new Set(PROPS.map(p => p.city))];
  document.getElementById('cityChips').innerHTML = cities.map(c => `<button class="chip" type="button" data-city="${esc(c)}" aria-pressed="${filt.city === c}">${c || 'Tutte'}</button>`).join('');
}
function card(p) {
  const [lbl, cls] = STATUS[p.status];
  const raised = Math.round(p.sold * 100);
  const prog = p.status === 'presto'
    ? `<div class="progress"><div class="row"><span>${esc(p.close)}</span></div><div class="bar"><i style="width:0"></i></div></div>`
    : `<div class="progress"><div class="row"><span><b>${raised}%</b> raccolto</span><span>${nf.format(p.investors)} investitori</span></div><div class="bar"><i style="width:${raised}%"></i></div></div>`;
  const foot = p.status === 'raccolta' ? 'Chiude il ' + p.close : p.status === 'chiuso' ? 'Raccolta completata' : 'Lista d’attesa aperta';
  return `<article class="card">
    <figure>${facade(p)}<span class="pill ${cls}">${lbl}</span><span class="tag">Esempio</span></figure>
    <div class="body">
      <div><h3>${esc(p.name)}</h3><div class="where">${esc(p.street)} · ${esc(p.area)}, ${esc(p.city)} · ${esc(p.type)}</div></div>
      <dl class="kv"><div><dt>Valore</dt><dd>${mln(p.value)}</dd></div><div><dt>Per token</dt><dd>${eur.format(p.price)}</dd></div><div><dt>Rend. netto stim.</dt><dd>${pct(p.yield)}</dd></div></dl>
      ${prog}
      <div class="foot"><span class="small">${esc(foot)}</span><button class="btn sm ${p.status === 'raccolta' ? 'primary' : 'ghost'}" type="button" data-open="${p.id}">Dettagli</button></div>
    </div></article>`;
}
function renderGrid() {
  const order = { raccolta: 0, presto: 1, chiuso: 2 };
  const list = PROPS.filter(p => (!filt.city || p.city === filt.city) && (!filt.type || p.type === filt.type) && (!filt.status || p.status === filt.status));
  if (filt.sort === 'yield') list.sort((a, b) => b.yield - a.yield);
  else if (filt.sort === 'value') list.sort((a, b) => b.value - a.value);
  else list.sort((a, b) => order[a.status] - order[b.status] || b.sold - a.sold);
  document.getElementById('resultCount').textContent = `${list.length} ${list.length === 1 ? 'immobile' : 'immobili'}`;
  document.getElementById('grid').innerHTML = list.length ? list.map(card).join('') : `<div class="empty">Nessun immobile con questi filtri. <button class="btn sm ghost" type="button" id="resetF">Azzera i filtri</button></div>`;
}

// property sheet
let lastFocus = null;
function openProp(id) {
  const p = byId[id]; if (!p) return;
  lastFocus = document.activeElement;
  const [lbl, cls] = STATUS[p.status];
  const gross = p.rent / p.value * 100;
  const cta = p.status === 'raccolta' ? 'Prenota i token' : 'Avvisami all’apertura';
  document.getElementById('modalRoot').innerHTML = `<div class="modal" data-close>
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle">
      <div class="left">
        <div class="sheet-head"><div style="display:grid;gap:.4rem"><div style="display:flex;gap:.5rem;flex-wrap:wrap"><span class="pill ${cls}">${lbl}</span><span class="pill">Esempio</span></div><h2 id="sheetTitle" style="font-size:2.25rem">${esc(p.name)}</h2><div class="small">${esc(p.street)} · ${esc(p.area)}, ${esc(p.city)}</div></div><button class="close" type="button" data-close aria-label="Chiudi">×</button></div>
        <figure>${facade(p, true)}</figure>
        <dl class="facts">
          <div><dt>Tipologia</dt><dd>${esc(p.type)}</dd></div>
          <div><dt>Valore di perizia</dt><dd>${eur.format(p.value)}</dd></div>
          <div><dt>Superficie</dt><dd>${nf.format(p.sqm)} m²</dd></div>
          <div><dt>Unità</dt><dd>${p.units}</dd></div>
          <div><dt>Occupazione</dt><dd>${esc(p.occ)}</dd></div>
          <div><dt>Contratti</dt><dd>${esc(p.lease)}</dd></div>
          <div><dt>Canone annuo lordo</dt><dd>${eur.format(p.rent)}</dd></div>
          <div><dt>Rendimento lordo</dt><dd>${pct(gross)}</dd></div>
          <div><dt>Classe energetica</dt><dd>${esc(p.energy)}</dd></div>
          <div><dt>Anno di costruzione</dt><dd>${p.year}</dd></div>
          <div><dt>Token emessi</dt><dd>${nf.format(p.supply)}</dd></div>
          <div><dt>Orizzonte previsto</dt><dd>5 anni</dd></div>
        </dl>
        <div style="display:grid;gap:.6rem"><div class="eyebrow">Documenti</div>
          <div class="doclist"><div><span>Documento informativo</span><span class="small">Dopo la registrazione</span></div><div><span>Perizia di stima</span><span class="small">Dopo la registrazione</span></div><div><span>Due diligence tecnica e legale</span><span class="small">Dopo la registrazione</span></div><div><span>Contratti di locazione (estratto)</span><span class="small">Dopo la registrazione</span></div></div>
        </div>
      </div>
      <div class="right">
        <div class="eyebrow">${p.status === 'presto' ? 'Lista d’attesa' : 'Prenotazione'}</div>
        ${p.status === 'chiuso' ? `<p style="font-size:1rem">La raccolta per questo immobile è chiusa.</p>` : `
        <form id="resForm" novalidate style="display:grid;gap:1rem">
          ${p.status === 'raccolta' ? `
          <div class="field"><label for="rQty">Numero di token</label>
            <div class="stepper"><button type="button" data-step="-1" aria-label="Meno token">−</button><input id="rQty" type="number" min="1" step="1" value="10" inputmode="numeric"><button type="button" data-step="1" aria-label="Più token">+</button></div></div>
          <div class="calc" id="calc"></div>` : `<p style="font-size:1rem">${esc(p.close)}. Lascia la tua email e ti avvisiamo appena si apre la raccolta.</p>`}
          <div class="field"><label for="rName">Nome e cognome</label><input id="rName" autocomplete="name" required></div>
          <div class="field"><label for="rEmail">Email</label><input id="rEmail" type="email" autocomplete="email" required></div>
          <label class="check"><input type="checkbox" id="rConsent" required> <span>Ho letto l'<a href="/privacy/">informativa privacy</a> e accetto di essere contattato.</span></label>
          <div class="count" id="resErr" aria-live="polite"></div>
          <button class="btn primary" type="submit">${cta}</button>
          <p class="small">${p.status === 'raccolta' ? 'La prenotazione non è vincolante. Per sottoscrivere servono la verifica dell’identità e il questionario di adeguatezza.' : 'Puoi annullare l’iscrizione in qualsiasi momento.'}</p>
        </form>`}
        <p class="small">Rendimento netto stimato ${pct(p.yield)}, non garantito. Il valore dei token può scendere.</p>
      </div>
    </div></div>`;
  document.body.style.overflow = 'hidden';
  document.querySelector('.modal .close').focus();
  if (p.status === 'raccolta') updateCalc(p);
  const form = document.getElementById('resForm');
  if (!form) return;
  form.addEventListener('input', () => { if (p.status === 'raccolta') updateCalc(p); });
  form.addEventListener('click', e => {
    const b = e.target.closest('[data-step]'); if (!b) return;
    const q = document.getElementById('rQty');
    q.value = Math.max(1, (parseInt(q.value, 10) || 0) + parseInt(b.dataset.step, 10));
    updateCalc(p);
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('rName').value.trim(), email = document.getElementById('rEmail').value.trim();
    const err = document.getElementById('resErr');
    if (!name || !EMAIL_RE.test(email)) { err.textContent = 'Inserisci nome ed email validi.'; return; }
    if (!document.getElementById('rConsent').checked) { err.textContent = 'Serve il consenso per poterti ricontattare.'; return; }
    const qty = p.status === 'raccolta' ? Math.max(1, parseInt(document.getElementById('rQty').value, 10) || 1) : 0;
    const btn = form.querySelector('button[type="submit"]'); btn.disabled = true; btn.textContent = 'Invio in corso…';
    const ok = await submitLead(qty ? 'reservation' : 'waitlist', { name, email, property: p.id, tokens: qty });
    form.outerHTML = ok
      ? `<div class="done-msg" role="status"><b>${qty ? 'Prenotazione registrata' : 'Iscrizione registrata'}</b><span>${qty ? `${nf.format(qty)} token di ${esc(p.name)} per ${eur.format(qty * p.price)}. Ti scriviamo per la verifica dell’identità e la sottoscrizione.` : `Ti avvisiamo all’apertura di ${esc(p.name)}.`}</span></div>`
      : fallbackHTML(qty ? `Prenotazione: ${qty} token di ${p.name}.` : `Lista d’attesa: ${p.name}.`);
  });
}
function updateCalc(p) {
  const q = Math.max(1, parseInt(document.getElementById('rQty').value, 10) || 1);
  const amt = q * p.price;
  document.getElementById('calc').innerHTML = `<div class="big"><span>Importo</span><b>${eur.format(amt)}</b></div><div><span>Quota dell'immobile</span><b>${(q / p.supply * 100).toLocaleString('it-IT', { maximumFractionDigits: 3 })}%</b></div><div><span>Canoni annui stimati</span><b>${eur2.format(amt * p.yield / 100)}</b></div><div><span>Token disponibili</span><b>${nf.format(Math.round(p.supply * (1 - p.sold)))}</b></div>`;
}
function closeModal() {
  const root = document.getElementById('modalRoot');
  if (!root.innerHTML) return;
  root.innerHTML = ''; document.body.style.overflow = '';
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

document.addEventListener('click', e => {
  const op = e.target.closest('[data-open]'); if (op) { openProp(op.dataset.open); return; }
  if (e.target.matches('[data-close]') || e.target.closest('button[data-close]')) { closeModal(); return; }
  const ch = e.target.closest('[data-city]'); if (ch) { filt.city = ch.dataset.city; renderChips(); renderGrid(); return; }
  if (e.target.id === 'resetF') {
    Object.assign(filt, { city: '', type: '', status: '' });
    ['fType', 'fStatus'].forEach(i => { document.getElementById(i).value = ''; });
    renderChips(); renderGrid();
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.addEventListener('change', e => {
  if (e.target.id === 'fType') { filt.type = e.target.value; renderGrid(); }
  if (e.target.id === 'fStatus') { filt.status = e.target.value; renderGrid(); }
  if (e.target.id === 'fSort') { filt.sort = e.target.value; renderGrid(); }
});

renderStats(); renderChips(); renderGrid();
