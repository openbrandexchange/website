# Changelog

All notable changes to openbrandexchange.com. The site follows the specification's version in
its texts; the repository itself is versioned with [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-09-28

First complete version of the site, not yet deployed.

### Added
- Static Astro site in 25 languages (the 24 official EU languages plus Norwegian Bokmål), one
  English slug per page, browser language detection on `/` without cookies, `hreflang`,
  canonical URLs, sitemap, robots.txt, Open Graph and Twitter card tags with a preview image per
  language.
- Pages: home, for brands, automation, hosting, for retailers, developers, directory, downloads,
  FAQ, governance and name, privacy, cookie statement, imprint.
- Imprint and footer: "An initiative of Richard Lindhout · Open Brand Exchange Foundation (in
  formation)", hello@openbrandexchange.com and security@openbrandexchange.com; optional address,
  phone and registration number shown only once filled in.
- Public brand directory (`/directory.json`) with a demo entry, schema validation, listing rules,
  a discovery check on pull requests and a weekly re-check.
- Brochures for brands (6 pages) and retailers (4 pages) in all 25 languages, generated from the
  site's texts with an honest "ready in 0.1" / "coming next" split; switch-kit e-mails per language.
- Strict security headers (CSP without inline code, HSTS, frame-ancestors, referrer policy),
  CORS only on the directory.
- CI: directory, typecheck, build, link check, unit and output tests (locales complete and
  on-glossary, brochures fresh), licence policy, `npm audit`, Playwright + axe end-to-end tests,
  Lighthouse budgets. Deploy workflow for Cloudflare Pages. Dependabot.
- Docs: deploying, operations, security, brochures, translations; SECURITY, CONTRIBUTING (DCO),
  Code of Conduct, NOTICE, issue and pull request templates.

### Also in this release

#### Fixed

- Hosting, *Portal for web hosting*: the release file is `obx-portal-php-<version>.zip` (not `obx-node-php.zip`), and the steps now include making `data` and `config` writable, the setup code in `data/SETUP-CODE.txt` and the cron job; the first-start steps say where that edition keeps the code.
- Hosting, *Portal for Google Cloud & Docker*: the deploy script is `deploy/cloudrun.sh`, and it takes the project from `gcloud config` instead of asking.
- Automation: the admin paths are *Automatic upload → Access keys* and *Automatic upload → Scheduled imports → Add scheduled import*, in the portal's own words per language.
- Automation: the import modes are called what the portal calls them (*Only add and update*, *Also take missing articles offline*), and the note on the Portal for Cloudflare no longer says a scheduled import makes web versions of photos (it delivers originals; obx and the Imports screen make them).
- Hosting, *Portal for Cloudflare*: says that a portal in daily use needs the Workers Paid plan, instead of only pointing at free allowances.
- Hosting, Docker: `docker logs obx 2>&1 | grep -i "setup code"` (the node logs to standard error, so without `2>&1` the command found nothing); the secret key is written to a file once instead of being generated inside the command, where nobody could keep it; the Caddy example sets `OBX_TRUST_PROXY`, so rate limits count per visitor and not for everyone behind Caddy together.
- Hosting, *Portal for Google Cloud & Docker*: `DRY_RUN=1 ./deploy/cloudrun.sh` shows the commands first without changing anything.
- Developers: there are four conformance profiles (protocol, ingest, portal and security), not three.
- The footer says the CC-BY-4.0/MIT line is about this website; the specification, the SDK and admin UI, and the portals have their own licences (listed on the developers page).

#### Added

- Developers: the specification's rendered API reference at `/reference/`, the JSON Schemas at the address of their `$id` (`/schemas/v0.1/…`), and a page per error code at `/errors/<obx_error>`, the `type` of every problem the APIs answer with; `npm run sync:spec` copies them from the spec. The developers page links the reference next to each OpenAPI file.
- Downloads: the Kestrel example files as one zip (`/downloads/kestrel-example.zip`, built from the specification's fixtures with `scripts/build-example-zip.sh`), next to the link to the specification.
- For retailers: the developer example also shows `obx pull`.

[0.1.0]: https://github.com/openbrandexchange/website/releases/tag/v0.1.0
