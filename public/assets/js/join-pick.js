// Which collector card an email gets: shared by the page (join-card.js) and the Apple Wallet function, so both
// always agree. FNV-1a hash of the email; the class is picked by its odds (% chance), then a place in that class.
export function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

export function pick(email, landmarks, odds = {}) {
  const h = hash(String(email).trim().toLowerCase());
  let roll = h % 100, cls = 'landmark';
  for (const [k, p] of Object.entries(odds)) { if (roll < p) { cls = k; break; } roll -= p; }
  const pool = landmarks.filter(l => l.cls === cls).length ? landmarks.filter(l => l.cls === cls) : landmarks;
  return { lm: pool[(h >>> 7) % pool.length], piece: String((h >>> 8) % 1000 + 1).padStart(4, '0'), h };
}

export const mapUrl = lm => lm.url || `https://www.google.com/maps/search/?api=1&query=${lm.lat},${lm.lng}`;
