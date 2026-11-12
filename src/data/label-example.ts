// The care-label example on the retailers page: product KT-2001 of the spec's fictional test
// brand (spec fixtures/kestrel/products.csv). Keep it in step with the fixture.
export const labelExample = {
  styleNumber: 'KT-2001',
  colourCode: 'BLK',
  countryOfOrigin: 'VN',
  materials: [
    { part: 'outer', fibers: [{ fiber: 'polyester', percentage: 100, recycled: true }] },
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
