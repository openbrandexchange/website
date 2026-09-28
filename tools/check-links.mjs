#!/usr/bin/env node
// Checks every internal link in the built site: href/src/hreflang targets must exist as files,
// and #fragments must match an id on the target page. External links are listed with --external
// (not fetched, so the check works offline and never hits other people's servers in CI).
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, posix, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://openbrandexchange.com';

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

export function checkSite(root) {
  const files = walk(root);
  const pages = files.filter((f) => f.endsWith('.html'));
  const idCache = new Map();
  const ids = (file) => {
    if (!idCache.has(file)) {
      const html = readFileSync(file, 'utf8');
      idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => decode(m[1]))));
    }
    return idCache.get(file);
  };
  const resolveFile = (path) => {
    const p = join(root, decodeURIComponent(path));
    if (path.endsWith('/')) return existsSync(join(p, 'index.html')) ? join(p, 'index.html') : null;
    if (existsSync(p) && statSync(p).isFile()) return p;
    return null;
  };

  const problems = [];
  const external = new Set();
  let checked = 0;
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    const pagePath = '/' + relative(root, page).split(sep).join('/');
    for (const m of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
      let target = decode(m[2]);
      if (!target || target.startsWith('mailto:') || target.startsWith('data:')) continue;
      if (target.startsWith(SITE)) target = target.slice(SITE.length) || '/';
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//')) {
        external.add(target);
        continue;
      }
      checked++;
      const [pathPart, fragment] = target.split('#');
      const path = pathPart === '' ? pagePath : pathPart.startsWith('/') ? pathPart : posix.join(posix.dirname(pagePath), pathPart);
      const file = pathPart === '' ? page : resolveFile(path.split('?')[0]);
      if (!file) {
        problems.push(`${pagePath}: broken link ${target}`);
        continue;
      }
      if (fragment && file.endsWith('.html') && !ids(file).has(fragment)) {
        problems.push(`${pagePath}: missing anchor ${target}`);
      }
    }
  }
  return { problems, external: [...external].sort(), checked, pages: pages.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const root = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'dist';
  const { problems, external, checked, pages } = checkSite(root);
  if (process.argv.includes('--external')) for (const e of external) console.log(`external: ${e}`);
  if (problems.length) {
    console.error(`${problems.length} broken link(s):`);
    for (const p of problems.slice(0, 200)) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`links ok: ${checked} internal links on ${pages} pages, ${external.length} distinct external links`);
}
