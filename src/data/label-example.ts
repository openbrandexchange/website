// The care-label example on the retailers page: product KT-2001 of the spec's fictional test
// brand (spec fixtures/kestrel/products.csv). Keep it in step with the fixture.
export const labelExample = {
  styleNumber: 'KT-2001',
  colourCode: 'BLK',
  countryOfOrigin: 'VN',
  materials: [
    { part: 'outer', fibers: [{ fiber: 'recycled_polyester', percentage: 100 }] },
    {
      part: 'lining',
      fibers: [
        { fiber: 'polyamide', percentage: 88 },
        { fiber: 'elastane', percentage: 12 },
      ],
    },
  ],
  care: ['wash_30', 'do_not_bleach', 'do_not_tumble_dry', 'do_not_iron', 'do_not_dry_clean'],
  variants: [
    { size: 'S', gtin: '02000200101017' },
    { size: 'M', gtin: '02000200101024' },
    { size: 'L', gtin: '02000200101031' },
  ],
} as const;

/** The fields as a retailer's software receives them from GET /obx/v1/products/{id}, one line per
 * part, care code and size so the example stays short. */
const line = (v: unknown) => JSON.stringify(v).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/\{"/g, '{ "').replace(/\}/g, ' }').replace(/ \},\{/g, ' }, {');
export const labelJson = [
  '{',
  `  "style_number": "${labelExample.styleNumber}",`,
  '  "materials": [',
  labelExample.materials.map((m) => `    ${line(m)}`).join(',\n'),
  '  ],',
  '  "care": [',
  labelExample.care.map((code) => `    ${line({ code, text: null })}`).join(',\n'),
  '  ],',
  `  "country_of_origin": "${labelExample.countryOfOrigin}",`,
  '  "variants": [',
  labelExample.variants.map((v) => `    ${line({ size: v.size, gtin: v.gtin, color: { code: labelExample.colourCode } })}`).join(',\n'),
  '  ]',
  '}',
].join('\n');
