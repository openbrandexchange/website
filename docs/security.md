# Security of the website

What protects openbrandexchange.com, and why. Report problems as described in
[SECURITY.md](../SECURITY.md).

## No server-side code

The site is static files. There are no forms, accounts, cookies, databases or APIs on this
domain, so there is nothing to inject into or take over. The attack surface is: the content we
publish, the scripts we run in visitors' browsers, and the deploy pipeline.

## Headers (`public/_headers`)

| Header | Value | Why |
|---|---|---|
| Content-Security-Policy | `default-src 'self'`, scripts only from the site, (if statistics are on) `static.cloudflareinsights.com` and Cloudflare Turnstile (`challenges.cloudflare.com`, script and frame, loaded on the online check page only), no inline script or style, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` | nothing but our own files runs; the tests fail on any inline script or style attribute and on any CSP violation in the browser |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` | HTTPS only, also on subdomains; not preloaded, so it can still be undone |
| X-Frame-Options / frame-ancestors | `DENY` / `'none'` | no clickjacking |
| Referrer-Policy | `strict-origin-when-cross-origin` | other sites see at most our origin |
| X-Content-Type-Options | `nosniff` | files are used as their declared type |
| Cross-Origin-Opener-Policy | `same-origin` | no window references from other origins |
| Permissions-Policy | camera, microphone, geolocation, topics off | the site needs none of them |

**CORS** is sent only on `/directory.json`, the public list software reads from other origins
(`Access-Control-Allow-Origin: *`, no credentials). Every other file is same-origin only, the
same rule the portals apply to their discovery document.

The end-to-end tests serve `dist/` with these exact headers (`tools/serve-dist.mjs`) and check
them, so a change to `_headers` is tested before it is deployed.

## Scripts

Three small first-party files: `/js/early.js` (marks that JavaScript runs), `/js/site.js`
(menu, copy buttons, directory search, remembering the language choice) and `/js/lang.js`
(language choice on `/`). No framework runtime, no third-party code unless visitor statistics
are switched on.

## The directory

`public/directory.json` points visitors and software at brand portals, so an entry is a trust
decision. CI validates every entry against the spec's schema and listing rules (sorted ids,
`https://…/.well-known/obx`, no reserved domains for real entries, demo entries marked) and, on
pull requests, fetches the portal's discovery document. Only the brand, or its hosting provider
on its behalf, may request a listing; a maintainer reviews every pull request.

## Supply chain

- Dependencies are build tools only; nothing from `node_modules` is shipped except what Astro
  generates from our own code. `npm audit --omit=dev` must be clean in CI.
- `tools/check-licenses.mjs` enforces a licence policy on every installed package.
- GitHub Actions use pinned major versions from GitHub (`actions/*`) only; Dependabot updates
  them. The deploy token is scoped to Cloudflare Pages edit on one account and is available
  only to the `production` environment on `main`.
- The brochures and social images are generated locally and committed; their input hashes are
  checked by the tests, so a changed PDF without a changed source is visible in review.
