# Contributing to openbrandexchange.com

Thank you for helping. Corrections, translations, directory listings and provider listings are
all welcome. Everyone follows the [Code of Conduct](CODE_OF_CONDUCT.md); how decisions about
the standard are made is in the spec's [governance](https://github.com/openbrandexchange/spec/blob/main/docs/governance.md).

- **Vulnerabilities:** never in public; see [SECURITY.md](SECURITY.md).
- **A brand in the directory:** see "Getting a brand listed" in the [README](README.md).
- **A translation:** see [docs/translations.md](docs/translations.md).

## Making a change

```sh
npm ci
npm run dev             # http://localhost:4321/
npm run check           # directory, typecheck, build, links, unit and output tests
npm run test:e2e        # Playwright + axe against dist/ (npx playwright install chromium once)
npm run build:brochures # only when brochure texts or layout changed (needs Chrome)
```

Every visible text is in `src/locales/<lang>.json`. `en.json` is the source; change the same key
in all 25 files in the same pull request. Words for the portal, API keys and automatic upload
come from the glossary and are checked by the tests. The brochures are made from the same
locale texts, so a text change can make `npm test` report stale PDFs: rebuild them with
`npm run build:brochures -- --lang <lang>` and commit the PDFs.

Style: short sentences, plain words, no protocol terms on brand and retailer pages (the tests
list them), examples with the fictional *Kestrel Outfitters* and `.example` domains. Never put
real customer data in examples.

## Sign your commits (DCO)

Contributions are accepted under the [Developer Certificate of Origin 1.1](https://developercertificate.org/).
By signing off you certify that you wrote the change or otherwise have the right to submit it
under this repository's licences (code MIT, content CC-BY-4.0). Add a `Signed-off-by` line to
every commit:

```sh
git commit -s -m "Fix the Danish cookie statement"
# Signed-off-by: Your Name <you@example.org>
```

Use your real name and an address you can be reached at. There is no contributor licence
agreement: you keep the copyright in your contribution. Pull requests with unsigned commits
cannot be merged; `git rebase --signoff main` fixes an existing branch.

## Deploying

Merges to `main` are deployed to Cloudflare Pages by the deploy workflow after CI passes
([docs/deploying.md](docs/deploying.md)).
