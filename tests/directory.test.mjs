import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkDirectory, loadValidator } from '../tools/validate-directory.mjs';

const validate = loadValidator();
const current = JSON.parse(readFileSync(new URL('../public/directory.json', import.meta.url), 'utf8'));
const entry = (over = {}) => ({
  id: 'acme',
  name: 'Acme',
  discovery_url: 'https://brands.acme.com/.well-known/obx',
  brands: ['Acme'],
  languages: ['en'],
  listed_at: '2026-09-28',
  ...over,
});
const dir = (entries) => ({ version: 1, updated_at: '2026-09-28T10:00:00Z', entries });

test('the published directory is valid and has one marked demo entry', () => {
  assert.deepEqual(checkDirectory(current, validate), []);
  const demos = current.entries.filter((e) => e['x-obx-demo'] === true);
  assert.equal(demos.length, 1);
  assert.equal(demos[0].name, 'Kestrel Outfitters');
});

test('a normal entry is accepted', () => {
  assert.deepEqual(checkDirectory(dir([entry()]), validate), []);
});

test('missing required fields are rejected by the schema', () => {
  const { brands, ...noBrands } = entry();
  assert.match(checkDirectory(dir([noBrands]), validate).join('\n'), /schema/);
});

test('unknown fields are rejected, x- extensions are allowed', () => {
  assert.match(checkDirectory(dir([entry({ logo: 'x' })]), validate).join('\n'), /schema/);
  assert.deepEqual(checkDirectory(dir([entry({ 'x-acme-note': 'hi' })]), validate), []);
});

test('entries must be unique and sorted by id', () => {
  assert.match(checkDirectory(dir([entry({ id: 'zeta' }), entry({ id: 'alpha' })]), validate).join('\n'), /sorted/);
  assert.match(checkDirectory(dir([entry(), entry()]), validate).join('\n'), /duplicate/);
});

test('discovery URLs must be https and point at /.well-known/obx', () => {
  assert.match(checkDirectory(dir([entry({ discovery_url: 'http://brands.acme.com/.well-known/obx' })]), validate).join('\n'), /https/);
  assert.match(checkDirectory(dir([entry({ discovery_url: 'https://brands.acme.com/obx' })]), validate).join('\n'), /well-known/);
});

test('reserved example hosts are only allowed for demo entries', () => {
  const example = { discovery_url: 'https://brands.acme.example/.well-known/obx' };
  assert.match(checkDirectory(dir([entry(example)]), validate).join('\n'), /demo/);
  assert.deepEqual(checkDirectory(dir([entry({ ...example, 'x-obx-demo': true })]), validate), []);
});
