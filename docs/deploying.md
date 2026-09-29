# Deploying

The site is plain static files in `dist/` (Astro, `npm run build`). Production is
**Cloudflare Pages**, project `openbrandexchange`, custom domain `openbrandexchange.com`.
Any other static host works too; see the end of this page.

## Automatic: GitHub Actions

`.github/workflows/deploy.yml` runs after the `ci` workflow succeeded on a push to `main`
(and by hand via *Run workflow*). It checks out the exact commit CI tested, runs
`scripts/deploy-cloudflare-pages.sh` (which runs `npm ci` and `npm run check` again) and uploads
`dist/` with Wrangler.

One-time setup by the owner of the Cloudflare account:

1. **API token:** Cloudflare dashboard → My Profile → API Tokens → Create token → *Custom*:
   permission **Account › Cloudflare Pages › Edit**, limited to the account that owns
   `openbrandexchange.com`. Nothing else.
2. **Account id:** dashboard → Workers & Pages → the account id in the right column.
3. **GitHub:** repository Settings → Secrets and variables → Actions:
   - secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`;
   - optional variables `CF_PAGES_PROJECT` (default `openbrandexchange`) and
     `PUBLIC_CF_ANALYTICS_TOKEN` (see [operations](operations.md#visitor-statistics)).
   - Settings → Environments → `production`: optionally require a reviewer before deploys.
4. **First deploy:** run the *deploy* workflow by hand. The script creates the Pages project
   (production branch `main`) if it does not exist yet.
5. **Domain:** Workers & Pages → openbrandexchange → Custom domains → add
   `openbrandexchange.com` and `www.openbrandexchange.com`. Because the zone is on the same
   Cloudflare account, the DNS records are created for you. Add a redirect rule
   `www.openbrandexchange.com/*` → `https://openbrandexchange.com/$1` (301).
6. **TLS:** SSL/TLS → Edge Certificates: *Always Use HTTPS* on, minimum TLS 1.2. The site sends
   HSTS with `includeSubDomains` (no preload), so every subdomain must be HTTPS-only.

Without the secrets the workflow only builds and checks, and says so in a notice.

## By hand

```sh
npx wrangler login                                    # once per machine
sh scripts/deploy-cloudflare-pages.sh                 # production
CF_PAGES_BRANCH=preview sh scripts/deploy-cloudflare-pages.sh   # preview URL, not production
DRY_RUN=1 sh scripts/deploy-cloudflare-pages.sh       # build and check only
```

## Rolling back

Workers & Pages → openbrandexchange → Deployments → an earlier deployment → *Rollback to this
deployment*. That is instant; then revert the commit on `main` so the next deploy does not bring
the problem back.

## Other static hosts

Upload `dist/` to any static host. Two things are Cloudflare-specific:

- `dist/_headers` (security headers, caching, CORS for `/directory.json`) and `dist/_redirects`
  (three short links). Netlify reads both files as they are. Elsewhere, configure the same
  headers in the server (see [security](security.md)); `tools/serve-dist.mjs` shows how they are
  applied.
- The home address `/` chooses a language in the browser (`/js/lang.js`), so no server logic is
  needed.

## Preview lock (until launch)

`functions/_middleware.js` puts the whole site behind a password until launch. It fails
closed: without the secret `PREVIEW_PASSWORD` every page answers 503.

```sh
npx wrangler pages secret put PREVIEW_PASSWORD --project-name openbrandexchange
```

Log in with any user name and that password. On launch day set the plain variable
`PUBLIC_LAUNCH=true` on the Pages project (or delete the middleware) and redeploy.
