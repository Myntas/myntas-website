# myntas-website

Website for Myntas S.r.l. Static HTML, CSS and JS: no build step, no dependencies to install.

## Deploy on Cloudflare

The site runs as a Cloudflare Worker with static assets, configured in `wrangler.jsonc`
(publishes `public/`, serves `404.html` for missing pages). In Cloudflare (Workers & Pages, Git integration):

- Build command: none
- Deploy command: `npx wrangler deploy`
- Production branch: `main`

Every push to `main` updates the site; other branches get their own preview address.

## Preview locally

```
python3 -m http.server 8000 --directory public
```

Then open http://localhost:8000. (The headers in `_headers` only apply on Cloudflare.)

See `CLAUDE.md` for the structure, editing rules and the launch checklist.

## Waitlist page `/join`

A single page for events (link or QR code): sign-up form, Myntas intro video after signup, leads saved in Brevo with
double opt-in and a lead score. English. Files:

- `public/join/copy.js`: **all the copy and settings** (texts, Turnstile site key, video files, links). Edit here, and send this file to MFC / legal for review.
- `public/join/index.html`, `public/join/confirmed/` (the page Brevo's confirmation link opens), `public/assets/js/join.js`, styles in `site.css` ("/join waitlist page").
- `functions/api/join.js`: Cloudflare Pages Function that checks Turnstile and the honeypot, computes `LEAD_SCORE` / `HOT_LEAD` and writes the contact to Brevo (double opt-in for new emails, update for existing ones).

### Event links and QR codes

Every event gets its own link, so each signup records where it came from (`SRC` in Brevo; without `src` it is `web`):

```
https://www.myntas.com/join/?src=sf-fellowship
```

Use lowercase letters, digits and dashes (max 40). To make the QR code (SVG, brand colours):

```
npx qrcode -t svg -e M -q 2 -d 3b2d19 -l f7f1e5 -o join-sf-fellowship.svg "https://www.myntas.com/join/?src=sf-fellowship"
```

Ready-made codes are in `docs/join-qr/` (`web`, `sf-fellowship`, `nova-demo-day`). Test every code with a phone before printing.

### One-time setup

1. **Brevo** (free plan): create an API key (SMTP & API → API keys), then run `BREVO_API_KEY=... node tools/brevo-setup.mjs` once. It creates the contact attributes and the `Waitlist` list and prints the list id.
2. In Brevo create the **double opt-in template** (Templates → new, with the confirmation button `{{ doubleoptin }}`) and note its id. Add an automation "contact added to list Waitlist" → welcome email with the intro video link (/assets/video/myntas-intro-v1.mp4). Segments by `ROLE` give the separate newsletter tracks (`ROLE` holds every role picked, comma separated, e.g. `token_investor,property_owner`: segment with "contains").
3. **Turnstile** (Cloudflare → Turnstile → add site `www.myntas.com`): put the site key in `copy.js` (`turnstileSiteKey`).
4. **Cloudflare Pages** project `myntas` → Settings → Variables and secrets: `BREVO_API_KEY` (secret), `BREVO_LIST_ID`, `BREVO_DOI_TEMPLATE_ID`, `TURNSTILE_SECRET` (secret). Redeploy.
5. Set `testMode: false` in `copy.js` (while it is `true` the form saves nothing: a preview for friends).
6. **Videos**: put the MP4 files in `public/assets/video/` (Cloudflare Pages: max 25 MB per file) and set `video.full` (and `video.poster`) in `copy.js`. It plays next to the form, after signup and on the confirmation page, with sound and a big play button. With `full: null` the page shows the poster and a "coming soon" line.

### Collector cards (signup reward)

After signup each person gets a collector card: one of the 109 places in `public/join/copy.js` (`CONFIG.landmarks`,
in three classes with the odds in `cardClasses`), picked from their email, so the same person always gets the same card.
They can open it on Google Maps, save it, share it on LinkedIn, X or WhatsApp (each place has a share page,
`/join/card/<id>/`, whose preview shows the card), and add it to Apple Wallet.

- **Adding a place**: add a line to `CONFIG.landmarks` (`art` + `v` pick one of the drawing families in
  `assets/js/join-card.js`), then regenerate its share image, Wallet thumbnail and share page:
  `npm i --no-save playwright && npx playwright install chromium && node tools/cards/generate.mjs`.
- **Apple Wallet** (`functions/api/wallet.js`): needs an Apple Developer account. Create a Pass Type ID
  (e.g. `pass.com.myntas.collector`) and its certificate, then set in the Pages project `PASS_TYPE_ID`, `APPLE_TEAM_ID`,
  `PASS_CERT` (PEM), `PASS_KEY` (PEM, secret), `PASS_KEY_PASSWORD` (if any) and `WWDR_CERT` (Apple WWDR G4, PEM),
  and set `appleWallet: true` in `copy.js` (until then the button on Apple devices only says the pass is coming soon). Use Apple's official "Add to Apple Wallet" badge before launch.
