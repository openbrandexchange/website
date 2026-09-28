#!/usr/bin/env node
// Copy the project glossary from the admin-ui repository (its source of truth) into
// src/data/glossary.json. The locale tests check the site's words against this copy.
//   npm run sync:glossary                      # expects ../admin-ui next to this repo
//   npm run sync:glossary -- /path/to/admin-ui/src/i18n/glossary.json
import { copyFileSync, existsSync } from 'node:fs';

const from = process.argv[2] ?? new URL('../../admin-ui/src/i18n/glossary.json', import.meta.url).pathname;
if (!existsSync(from)) {
  console.error(`Glossary not found at ${from}. Pass the path to admin-ui/src/i18n/glossary.json.`);
  process.exit(1);
}
copyFileSync(from, new URL('../src/data/glossary.json', import.meta.url));
console.log('Copied', from, '→ src/data/glossary.json. Run npm test to see which texts disagree.');
