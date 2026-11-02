// POST /api/lead (Cloudflare Pages Function): saves every form on the site as a row in the Notion database
// "Richieste sito Myntas". Needs the secret NOTION_TOKEN (a Notion internal integration with access to that
// database) in the Pages project settings; NOTION_DB can override the database id below.
// Any failure answers 5xx, and the page then shows the info@myntas.com message instead.
const DB = '1aa6cfcc660c411e9b90ecb66a8d9b88';
const KINDS = { 'early-access': 'Accesso anticipato', owner: 'Proprietario', newsletter: 'Newsletter', alerts: 'Avvisi offerte' };
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const text = v => ({ rich_text: v ? [{ text: { content: v } }] : [] });

export async function onRequestPost({ request, env }) {
  if (!env.NOTION_TOKEN) return json({ ok: false, error: 'not configured' }, 503);
  let d;
  try {
    if (Number(request.headers.get('content-length') || 0) > 20000) return json({ ok: false }, 413);
    d = await request.json();
  } catch (e) { return json({ ok: false }, 400); }
  const kind = KINDS[d.kind];
  const email = str(d.email, 200);
  if (!kind || !EMAIL_RE.test(email)) return json({ ok: false }, 400);
  if (str(d.website)) return json({ ok: true }); // honeypot field, filled only by bots

  const name = str(d.name, 200);
  const property = d.kind === 'owner'
    ? [str(d.type, 100), str(d.city, 100), d.value && `valore ${str(d.value, 60)}`, d.let && `locato: ${str(d.let, 60)}`, d.share && `quota: ${str(d.share, 60)}`].filter(Boolean).join(' · ')
    : '';
  const props = {
    Nome: { title: [{ text: { content: name || email } }] },
    Tipo: { select: { name: kind } },
    Email: { email },
    Profilo: text(str(d.profile, 200)),
    'Società': text(str(d.company, 200)),
    Immobile: text(property),
    Descrizione: text(str(d.description, 1900)),
    Pagina: text(str(d.page, 200)),
    Stato: { status: { name: 'Nuova' } }
  };
  const phone = str(d.phone, 60);
  if (phone) props.Telefono = { phone_number: phone };
  if (d.lang === 'it' || d.lang === 'en') props.Lingua = { select: { name: d.lang } };

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({ parent: { database_id: env.NOTION_DB || DB }, properties: props })
  });
  if (!res.ok) { console.error('notion', res.status, await res.text()); return json({ ok: false }, 502); }
  return json({ ok: true });
}

export const onRequest = () => json({ ok: false, error: 'method not allowed' }, 405);
