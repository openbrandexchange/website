## What and why

<!-- One or two sentences. Link the issue if there is one. -->

## Checklist

- [ ] `npm run check` passes (directory, typecheck, build, links, locales, brochures)
- [ ] Text changes made in `en.json` **and** the same key in the other 24 locale files
- [ ] Brochure texts or layout changed? `npm run build:brochures` run and the PDFs committed
- [ ] Visible change? `npm run test:e2e` passes (axe, keyboard, phone layout)
- [ ] `CHANGELOG.md` updated under Unreleased
- [ ] Every commit is signed off (`git commit -s`, see CONTRIBUTING.md)
- [ ] No real customer data; examples use Kestrel Outfitters and `.example` domains
