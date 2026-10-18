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
