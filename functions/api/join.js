// POST /api/join (Cloudflare Pages Function): the /join waitlist. Checks Turnstile and the honeypot, computes the
// lead score and writes the contact to Brevo: a new email gets the double opt-in email (the contact joins the list
// once confirmed); an email already in Brevo is updated in place. Settings (Pages project → Variables and secrets):
//   BREVO_API_KEY (secret), BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID, TURNSTILE_SECRET (secret; without it the check is skipped),
//   JOIN_CONFIRM_URL (optional, default https://www.myntas.com/join/confirmed/).
// Answers { ok: true } or { ok: false, error: 'invalid' | 'captcha' | 'server' }.

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

export async function onRequestPost({ request, env }) {
  if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID || !env.BREVO_DOI_TEMPLATE_ID) return json({ ok: false, error: 'server' }, 503);
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

  const listId = Number(env.BREVO_LIST_ID);
  const attributes = {
    FIRSTNAME: c.firstName, LASTNAME: c.lastName, COUNTRY: c.country, ROLE: c.role,
    LIKELIHOOD: c.likelihood, TICKET: c.ticket, PRIORITY: c.priority, LINKEDIN: c.linkedin, SRC: c.src,
    NEWSLETTER_OPTIN: c.newsletter, SIGNUP_AT: new Date().toISOString().slice(0, 10), LANG: c.lang,
    ...score(c)
  };

  // an email already in Brevo has confirmed before (double opt-in contacts exist only once confirmed): update it
  const found = await brevo(env, `/contacts/${encodeURIComponent(c.email)}`, 'GET');
  let res;
  if (found.ok) {
    res = await brevo(env, `/contacts/${encodeURIComponent(c.email)}`, 'PUT', { attributes, listIds: [listId] });
  } else if (found.status === 404) {
    res = await brevo(env, '/contacts/doubleOptinConfirmation', 'POST', {
      email: c.email, attributes, includeListIds: [listId], templateId: Number(env.BREVO_DOI_TEMPLATE_ID),
      redirectionUrl: env.JOIN_CONFIRM_URL || 'https://www.myntas.com/join/confirmed/'
    });
  } else res = found;
  if (!res.ok) { console.error('brevo', res.status, await res.text()); return json({ ok: false, error: 'server' }, 502); }
  return json({ ok: true });
}

export const onRequest = () => json({ ok: false, error: 'invalid' }, 405);
