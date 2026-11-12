// Ready-to-copy prompts for AI coding assistants (home page, "For developers"). In English on
// purpose: assistants read the specification in English. The parts in [brackets] are for the
// reader to fill in. Every link points at a file that exists (tests/site.test.mjs checks them).

const SPEC = 'https://github.com/openbrandexchange/spec/blob/main';

export const exportPrompt = `You are helping me connect our system to Open Brand Exchange (OBX), the open standard for how fashion brands deliver product photos and article data to retailers.

Read these first:
- Import format: ${SPEC}/docs/import-format.md
- Example data (fictional brand Kestrel): ${SPEC}/fixtures/kestrel/products.csv
- JSON Schemas: https://openbrandexchange.com/schemas/v0.2/

Our system: [name, version, database or API, programming language].

Task:
1. Write an export that produces products.csv exactly in the OBX import format: the same columns in the same order as the Kestrel example, one row per size, UTF-8.
2. Map our fields to the OBX columns. Include the fibre composition per part, the care codes and the EANs. List every OBX field we cannot fill, and every field of ours that has no place in OBX.
3. Rename or copy our product photos to the OBX naming rule {style}_{color}_{position}.jpg, for example KO-1001_NVY_1.jpg.
4. Add a test that runs the export on sample data and compares the result with the Kestrel example's columns.
5. Explain how to check the result with: obx push --dry-run

Ask me for anything you need to know about our system before you write code.`;

export const readPrompt = `You are helping me read Open Brand Exchange (OBX) in our software. OBX is the open standard for how fashion brands deliver product photos and article data to retailers; every brand runs its own portal with the same API.

Read these first:
- OBX in 10 minutes: ${SPEC}/docs/quickstart.md
- Protocol: ${SPEC}/docs/protocol.md
- OpenAPI contract: ${SPEC}/openapi/obx-protocol.yaml

Our software: [name, programming language, where products and images are stored].

Task:
1. Discover a brand portal through /.well-known/obx and get a token with OAuth2 client credentials.
2. Read the change feed: a full snapshot first, then only the changes, including deletions. Store the cursor so a restart continues where it stopped.
3. Map OBX products, variants (by EAN) and assets to our data model, including fibre composition, care and measurements.
4. Download the image renditions we need, and keep the usage rights and embargo dates with each image.
5. Handle errors and rate limits as the protocol describes, and add tests against the mock portal: obx-conformance mock.

Ask me for anything you need to know about our software before you write code.`;

export const prompts = [exportPrompt, readPrompt];
