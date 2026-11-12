# Translations

25 languages: bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nb, nl, pl,
pt, ro, sk, sl, sv. English is the source. Every text is in `src/locales/<lang>.json`.

## Rules the tests enforce

- Every locale has exactly the keys and array lengths of `en.json`, no empty strings, and the
  same `{placeholders}`.
- Fewer than 10 % of the longer strings may be identical to English.
- Brand- and retailer-facing texts use no protocol terms (node, ingest, GTIN, grant, cursor,
  tombstone, client credentials).
- The portal word, "API key for your software" and "automatic upload" follow the glossary
  (`src/data/glossary.json`, copied from admin-ui), and the publisher line follows the spec
  glossary (`src/data/glossary-publisher.json`): *Open Brand Exchange Foundation (in formation)*,
  with "(in formation)" translated and the name never translated.

To change a glossary word, change it in admin-ui (terms) or the spec (publisher line), then run
`npm run sync:glossary` here and fix what `npm test` reports.

## Quality

en, nl, de and fr were written with extra care. The other 21 languages are complete but need a
native review before a launch campaign in that market, Irish (ga) and Maltese (mt) first. Use the
*Translation* issue template for corrections. After changing texts, rebuild the brochures for that
language (`npm run build:brochures -- --lang <lang>`).
