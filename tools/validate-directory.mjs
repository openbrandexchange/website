#!/usr/bin/env node
// Validates a directory.json against the OBX Directory schema (the copy the site publishes at
// public/schemas/v0.1/, synced from the spec by npm run sync:spec) plus the listing rules from
// spec docs/directory.md:
// unique ids, entries sorted by id, https discovery URLs ending in /.well-known/obx.
// With --fetch it also asks every non-demo entry's discovery URL for its document.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const here = dirname(fileURLToPath(import.meta.url));

export function loadValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const dir = join(here, '..', 'public', 'schemas', 'v0.1');
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    ajv.addSchema(JSON.parse(readFileSync(join(dir, file), 'utf8')));
  }
  return ajv.getSchema('https://openbrandexchange.com/schemas/v0.1/Directory.json');
}

/** Returns a list of human-readable problems; empty means valid. */
export function checkDirectory(data, validate = loadValidator()) {
  const problems = [];
  if (!validate(data)) {
    for (const e of validate.errors) problems.push(`schema: ${e.instancePath || '/'} ${e.message}`);
    return problems;
  }
  const ids = data.entries.map((e) => e.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) problems.push(`duplicate ids: ${[...new Set(dupes)].join(', ')}`);
  const sorted = [...ids].sort();
  if (ids.join('\n') !== sorted.join('\n')) problems.push('entries must be sorted by id');
  for (const e of data.entries) {
    let u;
    try {
      u = new URL(e.discovery_url);
    } catch {
      problems.push(`${e.id}: discovery_url is not a URL`);
      continue;
    }
    if (u.protocol !== 'https:') problems.push(`${e.id}: discovery_url must use https`);
    if (u.pathname !== '/.well-known/obx') problems.push(`${e.id}: discovery_url must end in /.well-known/obx`);
    if (u.search || u.hash) problems.push(`${e.id}: discovery_url must not have a query or fragment`);
    const demo = e['x-obx-demo'] === true;
    if (demo && !/\.example$/.test(u.hostname)) problems.push(`${e.id}: demo entries must use a .example host`);
    if (!demo && /\.(example|test|invalid|localhost)$/.test(u.hostname))
      problems.push(`${e.id}: reserved host names are only allowed for demo entries (x-obx-demo: true)`);
  }
  return problems;
}

async function fetchDiscovery(entries) {
  const problems = [];
  for (const e of entries.filter((x) => x['x-obx-demo'] !== true)) {
    try {
      const res = await fetch(e.discovery_url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
      if (!res.ok) problems.push(`${e.id}: discovery answered HTTP ${res.status}`);
      else {
        const doc = await res.json();
        if (!doc || typeof doc !== 'object' || !doc.obx_version) problems.push(`${e.id}: discovery document has no obx_version`);
      }
    } catch (err) {
      problems.push(`${e.id}: discovery failed (${err.message})`);
    }
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--')) ?? 'public/directory.json';
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const problems = checkDirectory(data);
  if (!problems.length && args.includes('--fetch')) problems.push(...(await fetchDiscovery(data.entries)));
  if (problems.length) {
    console.error(`${file}: ${problems.length} problem(s)`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`${file}: valid (${data.entries.length} entries)`);
}
