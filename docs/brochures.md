# Brochures and social images

`public/downloads/brands-<lang>.pdf` (6 pages) and `public/downloads/retailers-<lang>.pdf`
(4 pages) in all 25 languages, plus `public/og/<lang>.jpg` (1200×630, the preview image
social networks and chat apps show for a link).

## Where the words come from

From the site's own locale files: the brochures reuse the texts of the home, brands, hosting,
retailers and FAQ pages, plus a `brochure` section in each `src/locales/<lang>.json` for what
only the brochures say (the flow on the cover, "ready in 0.1" versus "coming next", the call to
action). So a translation fixed on the site is fixed in the brochure too, and the honest split
between what works today and what is coming is kept in one place.

Contact is always hello@openbrandexchange.com; the cover and the last page carry the publisher
line from the glossary.

## Building

```sh
npm run build:brochures                  # everything (about 20 seconds)
npm run build:brochures -- --lang el,bg  # only some languages
CHROME_PATH=/path/to/chrome npm run build:brochures
```

The script (`scripts/build-brochures.mjs`) uses the installed Google Chrome (the macOS path by
default, `CHROME_PATH` elsewhere, else Playwright's Chromium). It lays out the HTML from
`scripts/brochure/template.mjs`, embeds the Inter typeface (Latin, Latin Extended, Greek and
Cyrillic), and:

- **refuses to write a page whose content overflows** its A4 sheet, so a long translation is
  never cut off silently;
- writes `public/downloads/manifest.json` with an input hash and page count per file.

`npm test` fails when a PDF is missing, has the wrong page count, uses any font other than Inter
(a sign that a glyph fell back to a system font), or is stale (its texts or layout changed but it
was not rebuilt).

## Checking by eye

```sh
pdftoppm -r 70 -png public/downloads/brands-el.pdf /tmp/brands-el   # poppler
```

Checked on 2026-09-28: every page of the Greek and Bulgarian brochures, and pages of the
German, Hungarian, Irish and English ones.
