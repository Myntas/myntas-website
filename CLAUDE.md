# Myntas website

Static marketing site for Myntas S.r.l. (myntas.com). Plain HTML, CSS and JS, no build step.
Hosted as a Cloudflare Worker with static assets (`wrangler.jsonc`): every push to `main` runs `npx wrangler deploy`, which publishes the `public/` folder as-is. Other branches get preview URLs.
Everything the website serves lives in `public/`; files outside it (this file, README, LICENSE) are never published.

## Structure

- `public/index.html` home (scroll story, "AUREA in tre passi" with illustrative phone screens, "Perché tokenizzare" investor/owner switch with six cards around the token (its own `.wrap` after the solid AUREA block; the 3D token moves to the slot as the section enters the viewport), "Trusted by", closing band with owner CTA and new-offer alerts); `public/en/index.html` its English version
- `public/aurea/index.html` AUREA intro page ("in arrivo"): hero with key points and two floating phones in HTML/CSS (listing and wallet, pills "Investi con solo 100 €" / "Basta un click"; no 3D on this page), animated dashboard preview in four steps, "La scheda immobile" (six cards), offer lifecycle timeline, "Primi passi" (profile, ID check, questionnaire, invest), "Per chi è AUREA", FAQ (`<details>`), early-access form (`kind: "early-access"`). Animations and facade drawings in `assets/js/aurea.js`
- `public/proprietari/index.html` owners page, built around the tokenization request form (`#ownerFormEl`, `kind: "owner"`): hero with key points, nine benefits, five-step process, request card with requirements and next steps, owners FAQ
- `public/privacy/`, `cookie/` legal pages (placeholders until the real texts exist), `404.html`
- `public/assets/css/site.css` all styles; colour and type tokens are at the top in `:root`
- `public/assets/js/scene.js` 3D stage (three.js r160, self-hosted in `assets/vendor/three`) on the home and Proprietari pages; it reads `<body data-page>`
- `public/assets/js/site.js` scroll buttons, home switch, sign-up and lead forms; `assets/js/aurea.js` AUREA preview animations
- `public/assets/fonts` self-hosted Montserrat (variable, OFL; every text on the site uses it: `--f-display`, `--f-body`, `--f-mono` all point to it, headings at `--w-display`). No requests to Google
- `public/assets/img` logo mark (`logo.svg`, header), full logo with wordmark (`myntas-logo.png`, footer), AUREA logo (`aurea-wordmark.svg`: lowercase "aurea" wordmark only, Merriweather Bold as outlines to match the "myntas" wordmark, gold `#d0b677`; renamed from aurea-logo.svg so cached copies of the old circle logo are not reused. Images are cached for 7 days: give a changed image a new file name), skyline, partner logos, share image
- `public/_headers` security headers (strict CSP) and cache rules; `robots.txt`; `sitemap.xml`

The header and footer are repeated in every HTML page: change them in all pages together. The footer is a rounded card with brand, quick links, newsletter sign-up, then the legal lines and risk notice.

## Languages

- Italian is the main language. English pages live under `public/en/` with the same path (`/aurea/` → `/en/aurea/`). Home, AUREA and Proprietari have English versions (`en/index.html`, `en/aurea/index.html`, `en/proprietari/index.html`).
- The IT/EN switcher is the `.lang` group at the right end of the header. Its IT link points to the Italian page itself; the EN link points to the page's English version, or to `/en/` while that does not exist yet. Below 420px it shows only the other language.
- When you add or change copy on a page that has an English version, update both. English pages link to the Italian pages that are not translated yet (privacy, cookie).
- Translated pairs carry `hreflang` alternates; add them to each new pair and add new English URLs to `sitemap.xml`.

## Rules

- Copy is in Italian (English on `/en/` pages). No em dashes. Short, plain sentences.
- Myntas operates in Italy only: never describe it as Swiss or global.
- Don't stress Italy or Italian in the copy, and say "immobile/immobili" rather than "edificio", "affitti" rather than "canoni". Don't mention the vehicle (SPV, "veicolo") in marketing copy.
- Never publish invented properties, yields or figures as real. Regulatory wording ("regolamentato", "strumento finanziario", etc.) needs counsel's sign-off before it goes live.
- No third-party hosts: the CSP in `_headers` allows only the site itself. Fonts, scripts and images must be self-hosted. No tracking scripts without a cookie banner and consent.
- If you change the inline import map in the page `<head>`, update its sha256 hash in `_headers`, or the 3D stops loading.
- Brand colours: cream `#f7f1e5`, brown `#3b2d19`, text `#5b564c`, golds `#a37e2d`, `#b79144`, `#725920`, `#8a6a2b`.

## Open items

- Forms post JSON to `/api/lead` (owner proposals, AUREA reservations and waitlist, footer newsletter `kind: "newsletter"`, home offer alerts `kind: "alerts"`, AUREA `kind: "early-access"` with name and profile), which does not exist yet. Until it does, visitors see a message with info@myntas.com.
- "Accedi" links to the current Base44 app at `https://myntas.com/Account`. Move the app to a subdomain (e.g. app.myntas.com) and update every page before switching the domain.
- AUREA is an intro page with no listings. Its preview uses invented example properties, always marked "Esempio" (Palazzo Belvedere, Corte dei Tigli, Casa Ginestra, Villa Glicine, Palazzo Fibonacci; "Residenza Aurora" on the home phone screens). Never real cities or addresses. The "Uscita" phase, the FAQ answers (token rights, resale, costs, who can invest) and the AML/questionnaire steps need counsel to confirm.
- The Nova Ventures logo in "Powered by" is the real one but low resolution (121×43 PNG from a JPG): replace with an SVG or larger file.

## Launch checklist (before pointing myntas.com here)

1. AUREA is now an intro + early-access page. Real offerings, with their documents, go live only on the AUREA app.
2. Privacy and cookie texts in `privacy/` and `cookie/`; P.IVA in the footer of every page.
3. Counsel's sign-off on all regulatory wording.
4. Written permission from each partner shown in "Trusted by"; high-resolution Nova Ventures logo.
5. `/api/lead` endpoint live (destination: Notion CRM and/or email).
6. "Accedi" pointing at the app subdomain.
7. Remove `<meta name="robots" content="noindex, nofollow">` from every page and replace `robots.txt` with the launch version noted inside it.
