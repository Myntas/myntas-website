// Which collector card an email gets: shared by the page (join-card.js) and the Notion and Apple Wallet functions, so
// all agree. FNV-1a hash of the email; the rarity is picked by its odds (% chance), then a place of that rarity,
// then the piece number within that rarity's run (1000 common ... 25 legendary).
export function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

// a place's rarity: set in copy.js for myths, mysteries and space; real landmarks are uncommon for about a third of them
export const tierOf = lm => lm.tier || (hash(lm.id) % 3 === 0 ? 'uncommon' : 'common');

export function pick(email, landmarks, rarities) {
  const h = hash(String(email).trim().toLowerCase());
  let roll = h % 100, tier = 'common';
  for (const [k, r] of Object.entries(rarities)) { if (roll < r.odds) { tier = k; break; } roll -= r.odds; }
  let pool = landmarks.filter(l => tierOf(l) === tier);
  if (!pool.length) { tier = 'common'; pool = landmarks.filter(l => tierOf(l) === tier); }
  const of = rarities[tier].pieces;
  return { lm: pool[(h >>> 7) % pool.length], tier, of, piece: String((h >>> 8) % of + 1).padStart(String(of).length, '0'), h };
}

export const mapUrl = lm => lm.url || `https://www.google.com/maps/search/?api=1&query=${lm.lat},${lm.lng}`;
