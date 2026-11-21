# Contributing to openbrandexchange.com

Thank you for helping. Corrections, translations, directory listings and provider listings are
all welcome. Everyone follows the [Code of Conduct](CODE_OF_CONDUCT.md); how decisions about
the standard are made is in the spec's [governance](https://github.com/openbrandexchange/spec/blob/main/docs/governance.md).

- **Vulnerabilities:** never in public; see [SECURITY.md](SECURITY.md).
- **A brand in the directory:** see "Getting a brand listed" in the [README](README.md).
- **A translation:** see [docs/translations.md](docs/translations.md).

## Making a change

```sh
bun install
bun run dev             # http://localhost:4321/
bun run check           # directory, typecheck, build, links, unit and output tests
bun run test:e2e        # Playwright + axe against dist/ (bunx playwright install chromium once)
bun run build:brochures # only when brochure texts or layout changed (needs Chrome)
```

Every visible text is in `src/locales/<lang>.json`. `en.json` is the source; change the same key
in all 25 files in the same pull request. Words for the portal, API keys and automatic upload
come from the glossary and are checked by the tests. The brochures are made from the same
locale texts, so a text change can make `bun run test` report stale PDFs: rebuild them with
`bun run build:brochures -- --lang <lang>` and commit the PDFs.

Style: short sentences, plain words, no protocol terms on brand and retailer pages (the tests
list them), examples with the fictional *MAISON NOOR* and `.example` domains. Never put
real customer data in examples.

## Sign your commits, and the rights in your contribution

This website is not openly licensed: its code, design and texts are copyright of the Open Brand
Exchange Foundation (in formation), all rights reserved (see [LICENSE](LICENSE)). The repository is
public so that anyone can read it and suggest improvements.

By submitting a contribution (a pull request, a patch, an issue with text or code to use) you
confirm that you wrote it or otherwise have the right to submit it, and you grant the publisher of
this website, and the Open Brand Exchange Foundation once it is registered, a perpetual, worldwide,
free, non-exclusive and irrevocable licence to use, change, publish and relicense your
contribution as part of the website or otherwise. You keep the copyright in your contribution.
Changes to files that come from the specification (see [NOTICE](NOTICE)) belong in the
[spec repository](https://github.com/openbrandexchange/spec), under its CC-BY-4.0 licence.

Add a `Signed-off-by` line to every commit to confirm this
([Developer Certificate of Origin 1.1](https://developercertificate.org/) for the origin of the
change, the paragraph above for the rights):

```sh
git commit -s -m "Fix the Danish cookie statement"
# Signed-off-by: Your Name <you@example.org>
```

Use your real name and an address you can be reached at. Pull requests with unsigned commits
cannot be merged; `git rebase --signoff main` fixes an existing branch.

## Deploying

Merges to `main` are deployed to Cloudflare Pages by the deploy workflow after CI passes
([docs/deploying.md](docs/deploying.md)).
