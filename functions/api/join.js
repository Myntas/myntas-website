// POST /api/join (Cloudflare Pages Function): the /join waitlist. Checks Turnstile and the honeypot, computes the
// lead score and saves the signup to whichever of these is set up (Pages project → Variables and secrets):
//  - Notion: a row in "Richieste sito Myntas" (Tipo "Waitlist"), with NOTION_TOKEN (secret; same as /api/lead).
//  - Brevo: a new email gets the double opt-in email (the contact joins the list once confirmed); an email already
//    in Brevo is updated in place. BREVO_API_KEY (secret), BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID,
//    JOIN_CONFIRM_URL (optional, default https://www.myntas.com/join/confirmed/).
// TURNSTILE_SECRET (secret) turns on the anti-spam check. The signup counts as saved when at least one of the two works.
// Answers { ok: true, email } (email: true when Brevo sends the confirmation email) or { ok: false, error: 'invalid' | 'captcha' | 'server' }.

const ROLES = ['token_investor', 'property_owner'];
const LIKELIHOOD = { very_likely: 3, maybe: 1, just_curious: 0 };
const TICKET = { '25k_plus': 3, '5k_25k': 2, '1k_5k': 1, under_1k: 0 };
const PRIORITY = ['income', 'growth', 'diversification'];
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const SRC_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// LEAD_SCORE 0-8 and HOT_LEAD (score 5 or more), from the brief: likelihood 3/1/0, ticket 3/2/1/0, LinkedIn +1, met in person (src not web) +1
export function score({ likelihood, ticket, linkedin, src }) {
  const s = (LIKELIHOOD[likelihood] ?? 0) + (TICKET[ticket] ?? 0) + (linkedin ? 1 : 0) + (src !== 'web' ? 1 : 0);
  return { LEAD_SCORE: s, HOT_LEAD: s >= 5 };
}

export function clean(d) {
  // one or more roles (an array; a single string is still accepted), kept in the order of ROLES
  const given = Array.isArray(d.role) ? d.role : [d.role];
  const roles = ROLES.filter(r => given.includes(r));
  const investor = roles.includes('token_investor');
  let linkedin = investor ? str(d.linkedin, 200) : '';
  if (linkedin && !/^https?:\/\//i.test(linkedin)) linkedin = 'https://' + linkedin; // loose: keep what was typed
  const src = SRC_RE.test(str(d.src, 40).toLowerCase()) ? str(d.src, 40).toLowerCase() : 'web';
  return {
    firstName: str(d.firstName, 80), lastName: str(d.lastName, 80), email: str(d.email, 160).toLowerCase(),
    country: /^[A-Z]{2}$|^OTHER$/.test(str(d.country, 5)) ? str(d.country, 5) : '',
    roles, role: roles.join(','),
    likelihood: investor && d.likelihood in LIKELIHOOD ? d.likelihood : '',
    ticket: investor && d.ticket in TICKET ? d.ticket : '',
    priority: investor && PRIORITY.includes(d.priority) ? d.priority : '',
    linkedin, src,
    newsletter: d.consentNewsletter === true,
    consent: d.consentUpdates === true,
    lang: d.lang === 'it' ? 'it' : 'en'
  };
}

async function brevo(env, path, method, body) {
  return fetch(`https://api.brevo.com/v3${path}`, {
    method, headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
}

const NOTION_DB = '1aa6cfcc660c411e9b90ecb66a8d9b88';
const INTEREST = { token_investor: 'Investire in token', property_owner: 'Tokenizzare un immobile' };
const txt = v => ({ rich_text: v ? [{ text: { content: v } }] : [] });

async function toNotion(env, c, sc) {
  const props = {
    Nome: { title: [{ text: { content: `${c.firstName} ${c.lastName}`.trim() || c.email } }] },
    Tipo: { select: { name: 'Waitlist' } },
    Email: { email: c.email },
    Interesse: { multi_select: c.roles.map(r => ({ name: INTEREST[r] })) },
    Paese: txt(c.country), Fonte: txt(c.src), Pagina: txt('/join/'),
    Probabilità: txt(c.likelihood), Ticket: txt(c.ticket), Priorità: txt(c.priority),
    Punteggio: { number: sc.LEAD_SCORE }, 'Hot lead': { checkbox: sc.HOT_LEAD }, 'Newsletter sì': { checkbox: c.newsletter },
    Lingua: { select: { name: c.lang } }, Stato: { status: { name: 'Nuova' } }
  };
  if (c.linkedin) props.LinkedIn = { url: c.linkedin };
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({ parent: { database_id: env.NOTION_DB || NOTION_DB }, properties: props })
  });
  if (!res.ok) console.error('notion', res.status, await res.text());
  return res.ok;
}

async function toBrevo(env, c, sc) {
  const listId = Number(env.BREVO_LIST_ID);
  const attributes = {
    FIRSTNAME: c.firstName, LASTNAME: c.lastName, COUNTRY: c.country, ROLE: c.role,
    LIKELIHOOD: c.likelihood, TICKET: c.ticket, PRIORITY: c.priority, LINKEDIN: c.linkedin, SRC: c.src,
    NEWSLETTER_OPTIN: c.newsletter, SIGNUP_AT: new Date().toISOString().slice(0, 10), LANG: c.lang, ...sc
  };
  // an email already in Brevo has confirmed before (double opt-in contacts exist only once confirmed): update it
  const found = await brevo(env, `/contacts/${encodeURIComponent(c.email)}`, 'GET');
  let res;
  if (found.ok) res = await brevo(env, `/contacts/${encodeURIComponent(c.email)}`, 'PUT', { attributes, listIds: [listId] });
  else if (found.status === 404) res = await brevo(env, '/contacts/doubleOptinConfirmation', 'POST', {
    email: c.email, attributes, includeListIds: [listId], templateId: Number(env.BREVO_DOI_TEMPLATE_ID),
    redirectionUrl: env.JOIN_CONFIRM_URL || 'https://www.myntas.com/join/confirmed/'
  });
  else res = found;
  if (!res.ok) console.error('brevo', res.status, await res.text());
  return res.ok;
}

export async function onRequestPost({ request, env }) {
  const notion = !!env.NOTION_TOKEN, brevoOn = !!(env.BREVO_API_KEY && env.BREVO_LIST_ID && env.BREVO_DOI_TEMPLATE_ID);
  if (!notion && !brevoOn) return json({ ok: false, error: 'server' }, 503);
  let d;
  try {
    if (Number(request.headers.get('content-length') || 0) > 20000) return json({ ok: false, error: 'invalid' }, 413);
    d = await request.json();
  } catch (e) { return json({ ok: false, error: 'invalid' }, 400); }
  if (str(d.website)) return json({ ok: true }); // honeypot: bots fill it, people never see it

  if (env.TURNSTILE_SECRET) {
    const form = new FormData();
    form.append('secret', env.TURNSTILE_SECRET);
    form.append('response', str(d.captcha, 4096));
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) form.append('remoteip', ip);
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form }).then(r => r.json()).catch(() => ({}));
    if (!check.success) return json({ ok: false, error: 'captcha' }, 403);
  }

  const c = clean(d);
  if (!c.firstName || !c.lastName || !EMAIL_RE.test(c.email) || !c.country || !c.role || !c.consent) return json({ ok: false, error: 'invalid' }, 400);
  const sc = score(c);
  const results = await Promise.all([notion && toNotion(env, c, sc).catch(e => (console.error(e), false)), brevoOn && toBrevo(env, c, sc).catch(e => (console.error(e), false))]);
  return results.some(Boolean) ? json({ ok: true, email: !!results[1] }) : json({ ok: false, error: 'server' }, 502);
}

export const onRequest = () => json({ ok: false, error: 'invalid' }, 405);
