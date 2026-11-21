// The care-label example on the retailers page: product NA-2001 of the spec's fictional test
// brand (spec fixtures/maison-noor/products.csv), in the 0.3 shape: a fibre is a material code with a list of
// qualifiers (recycled, organic, …). Keep it in step with the fixture.
export const labelExample = {
  styleNumber: 'NA-2001',
  colourCode: 'BLK',
  countryOfOrigin: 'VN',
  materials: [
    { part: 'outer', fibers: [{ material: 'polyester', percentage: 100, qualifiers: ['recycled'] }] },
    {
      part: 'lining',
      fibers: [
        { material: 'polyamide', percentage: 88, qualifiers: [] },
        { material: 'elastane', percentage: 12, qualifiers: [] },
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
