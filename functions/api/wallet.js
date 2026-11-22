// POST /api/wallet (Cloudflare Pages Function): the collector card as an Apple Wallet pass (.pkpass).
// The thank-you screen posts email, name and src as a form (so the email stays out of URLs and logs); the card is
// recomputed from the email with the same logic as the page (assets/js/join-pick.js), so nobody can pick a card.
// Needs an Apple Developer "Pass Type ID" certificate, set in the Pages project (Variables and secrets):
//   PASS_TYPE_ID (e.g. pass.com.myntas.collector), APPLE_TEAM_ID, PASS_CERT (PEM), PASS_KEY (PEM, secret),
//   PASS_KEY_PASSWORD (if the key is encrypted, secret), WWDR_CERT (Apple WWDR G4 intermediate, PEM).
// Without them it answers 503 and the page does not show the button (CONFIG.appleWallet in copy.js).
import forge from '../_lib/forge.min.js';
import { zip } from '../_lib/zip.js';
import { pick, mapUrl } from '../../public/assets/js/join-pick.js';
import { COPY, CONFIG } from '../../public/join/copy.js';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const SRC_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;
const enc = new TextEncoder();
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

export function passJson({ lm, piece, h }, { name, src, env, T }) {
  const [cls, rarity] = T.cardClass[lm.cls];
  return {
    formatVersion: 1, passTypeIdentifier: env.PASS_TYPE_ID, teamIdentifier: env.APPLE_TEAM_ID,
    serialNumber: `${h.toString(16)}-${piece}`, organizationName: 'Myntas', description: `Myntas ${T.cardKicker}: ${lm.name}`,
    logoText: 'Myntas', foregroundColor: 'rgb(247, 241, 229)', backgroundColor: 'rgb(59, 45, 25)', labelColor: 'rgb(208, 182, 119)',
    generic: {
      headerFields: [{ key: 'class', label: cls, value: rarity }],
      primaryFields: [{ key: 'place', label: T.cardKicker, value: lm.name }],
      secondaryFields: [{ key: 'where', label: 'Location', value: lm.city }, { key: 'piece', label: T.cardPiece, value: `#${piece} / 1000` }],
      auxiliaryFields: [{ key: 'holder', label: T.cardHolder, value: name }],
      backFields: [
        { key: 'map', label: T.cardMap, value: mapUrl(lm) },
        { key: 'join', label: 'Myntas', value: 'https://www.myntas.com/join/' },
        { key: 'about', label: 'About this card', value: T.cardDisclaimer }
      ]
    }
  };
}

export async function buildPass(files, env) {
  // manifest: SHA-1 of every file; signature: detached PKCS#7 of the manifest with the pass certificate + WWDR
  const manifest = {};
  for (const [n, data] of Object.entries(files)) manifest[n] = hex(await crypto.subtle.digest('SHA-1', data));
  const manifestBytes = enc.encode(JSON.stringify(manifest));
  const cert = forge.pki.certificateFromPem(env.PASS_CERT), wwdr = forge.pki.certificateFromPem(env.WWDR_CERT);
  const key = env.PASS_KEY_PASSWORD ? forge.pki.decryptRsaPrivateKey(env.PASS_KEY, env.PASS_KEY_PASSWORD) : forge.pki.privateKeyFromPem(env.PASS_KEY);
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(new TextDecoder().decode(manifestBytes), 'utf8');
  p7.addCertificate(cert); p7.addCertificate(wwdr);
  p7.addSigner({ key, certificate: cert, digestAlgorithm: forge.pki.oids.sha256, authenticatedAttributes: [
    { type: forge.pki.oids.contentType, value: forge.pki.oids.data }, { type: forge.pki.oids.messageDigest }, { type: forge.pki.oids.signingTime, value: new Date() }
  ] });
  p7.sign({ detached: true });
  const der = forge.asn1.toDer(p7.toAsn1()).getBytes();
  const signature = Uint8Array.from(der, c => c.charCodeAt(0));
  return zip([...Object.entries(files), ['manifest.json', manifestBytes], ['signature', signature]]);
}

export async function onRequestPost({ request, env }) {
  if (!env.PASS_TYPE_ID || !env.APPLE_TEAM_ID || !env.PASS_CERT || !env.PASS_KEY || !env.WWDR_CERT) return new Response('Apple Wallet is not set up yet.', { status: 503 });
  const f = await request.formData().catch(() => null);
  const email = String(f?.get('email') || '').trim().toLowerCase().slice(0, 160);
  if (!EMAIL_RE.test(email)) return new Response('Invalid request.', { status: 400 });
  const name = String(f.get('name') || '').trim().slice(0, 40) || 'Founding collector';
  const src = SRC_RE.test(String(f.get('src') || '')) ? String(f.get('src')) : 'web';
  const T = COPY[f.get('lang')] || COPY.en;

  const card = pick(email, CONFIG.landmarks, CONFIG.cardClasses);
  const asset = async p => new Uint8Array(await (await env.ASSETS.fetch(new URL(p, request.url))).arrayBuffer());
  const thumb = await asset(`/assets/img/cards/${card.lm.id}-thumb.png`);
  const files = {
    'pass.json': enc.encode(JSON.stringify(passJson(card, { name, src, env, T }))),
    'icon.png': await asset('/assets/img/wallet/icon.png'), 'icon@2x.png': await asset('/assets/img/wallet/icon@2x.png'),
    'logo.png': await asset('/assets/img/wallet/logo.png'), 'logo@2x.png': await asset('/assets/img/wallet/logo@2x.png'),
    'thumbnail.png': thumb, 'thumbnail@2x.png': thumb
  };
  const pkpass = await buildPass(files, env);
  return new Response(pkpass, { headers: {
    'Content-Type': 'application/vnd.apple.pkpass', 'Content-Disposition': `attachment; filename="myntas-${card.lm.id}.pkpass"`, 'Cache-Control': 'no-store'
  } });
}

export const onRequest = () => new Response('Method not allowed.', { status: 405 });
