# Operations

The website has no server, database or accounts: operating it means keeping the content right,
the build green and the domain healthy.

## Health

| What | How |
|---|---|
| Site answers | `curl -sI https://openbrandexchange.com/en/` → `200`, with `content-security-policy` |
| Directory for software | `curl -s https://openbrandexchange.com/directory.json` → JSON with `entries` |
| Every page and link | `npm run check` (internal links and anchors, all 327 pages) |
| External links | `node tools/check-links.mjs dist --external` lists them for a manual check |
| Speed and accessibility | `npm run build && npm run lighthouse` (budgets below) |

A free external uptime check (for example Cloudflare Health Checks or any uptime service) on
`https://openbrandexchange.com/en/` is enough; alerts go to hello@openbrandexchange.com.

## Budgets (checked in CI)

Lighthouse, mobile preset, on `/en/`, `/el/for-brands/`, `/bg/hosting/`, `/de/for-retailers/`:
performance ≥ 90, accessibility 100, best practices ≥ 95, SEO 100, layout shift ≤ 0.05.
Measured locally on 2026-09-28: all four pages 100/100/100/100, LCP 0.9–1.1 s, CLS 0.

## Visitor statistics

Off by default: the site then loads no third-party script at all. To switch on cookieless
Cloudflare Web Analytics, create a site in Cloudflare → Analytics → Web Analytics, and set its
token as `PUBLIC_CF_ANALYTICS_TOKEN` (repository variable for the deploy workflow). The privacy
page already describes this; the CSP already allows the beacon. Cloudflare keeps only
aggregated counts, so there is nothing per visitor to delete on our side.

## Logs and data

The site keeps no logs, stores nothing about visitors and sets no cookies. Cloudflare's own
request logs are not exported. E-mail to hello@ and security@ is the only personal data: answer,
then delete when it is no longer needed (privacy page). The only per-visitor state is the
language choice in the visitor's own `localStorage`.

## Regular tasks

- **Dependabot** opens update pull requests weekly; merge when CI is green. The Inter font is
  pinned on purpose: updating it changes every brochure (rebuild them, see
  [brochures](brochures.md)).
- **Directory:** entries come in as pull requests; CI validates them and asks each portal for
  its discovery document. The *directory-recheck* workflow asks every listed portal again each
  Monday; when it fails, contact the brand and remove the entry once its portal has failed for
  30 days (spec docs/directory.md).
- **Brochures:** the last page says "Version 0.2, <month year>". Bump `EDITION` in
  `scripts/brochure/template.mjs` when the content changes and rebuild.
- **Specification:** after a spec change to its OpenAPI files, schemas or error table, run `npm run sync:spec` (it copies `site/` to `public/reference/`, the schemas to `public/schemas/` and the error codes to `src/data/errors.json`) and commit the result.
- **Glossary:** after a glossary change in admin-ui or the spec, run `npm run sync:glossary`
  and fix what `npm test` reports.
- **Privacy and cookie statements:** when anything about hosting, statistics or contact changes,
  update the texts in all languages and `PRIVACY_UPDATED` in `src/lib/org-core.ts`.

## Backups

Everything is in Git (the site, the directory, the brochures). Restore = check out and deploy.
Cloudflare keeps every deployment and can roll back to any of them.
