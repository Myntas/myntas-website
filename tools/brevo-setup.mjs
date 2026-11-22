// One-off Brevo setup for the /join waitlist: creates the contact attributes and the "Waitlist" list.
// Run once with your Brevo API key (Brevo → SMTP & API → API keys); safe to run again (existing items are skipped):
//   BREVO_API_KEY=xkeysib-... node tools/brevo-setup.mjs
// It prints the list id to put in the Pages variable BREVO_LIST_ID.
const KEY = process.env.BREVO_API_KEY;
if (!KEY) { console.error('Set BREVO_API_KEY first.'); process.exit(1); }
const api = (path, method = 'GET', body) => fetch(`https://api.brevo.com/v3${path}`, {
  method, headers: { 'api-key': KEY, 'Content-Type': 'application/json', accept: 'application/json' }, body: body && JSON.stringify(body)
});
// FIRSTNAME and LASTNAME exist in every Brevo account
const ATTRS = { COUNTRY: 'text', ROLE: 'text', LIKELIHOOD: 'text', TICKET: 'text', PRIORITY: 'text', LINKEDIN: 'text', SRC: 'text',
  LANG: 'text', CARD: 'text', LEAD_SCORE: 'float', HOT_LEAD: 'boolean', NEWSLETTER_OPTIN: 'boolean', SIGNUP_AT: 'date' };
for (const [name, type] of Object.entries(ATTRS)) {
  const r = await api(`/contacts/attributes/normal/${name}`, 'POST', { type });
  console.log(name, r.ok ? 'created' : `skipped (${r.status} ${(await r.json().catch(() => ({}))).message || ''})`);
}
const lists = await api('/contacts/lists?limit=50').then(r => r.json());
let list = (lists.lists || []).find(l => l.name === 'Waitlist');
if (!list) {
  const folders = await api('/contacts/folders?limit=10').then(r => r.json());
  let folderId = folders.folders?.[0]?.id;
  if (!folderId) folderId = (await api('/contacts/folders', 'POST', { name: 'Myntas' }).then(r => r.json())).id;
  list = await api('/contacts/lists', 'POST', { name: 'Waitlist', folderId }).then(r => r.json());
}
console.log(`\nWaitlist list id: ${list.id}  → set BREVO_LIST_ID=${list.id} in the Cloudflare Pages project`);
