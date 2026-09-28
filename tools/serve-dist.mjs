#!/usr/bin/env node
// A small static server for dist/ that behaves like Cloudflare Pages where it matters for tests:
// directory indexes, trailing-slash redirects, 404.html, and the rules in _headers and _redirects
// (so the end-to-end tests run under the real Content-Security-Policy).
//   node tools/serve-dist.mjs [dir=dist] [port=4321]
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const root = normalize(process.argv[2] ?? 'dist');
const port = Number(process.argv[3] ?? process.env.PORT ?? 4321);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.pdf': 'application/pdf', '.ico': 'image/x-icon',
};

/**
 * Parse _headers: a path pattern line, then indented "Name: value" lines. `*` matches anything.
 * As on Cloudflare Pages, a header set by several matching rules is joined with ", ", and
 * "! Name" detaches a header that a broader rule set.
 */
function parseHeaders(file) {
  if (!existsSync(file)) return [];
  const rules = [];
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) rules.push({ re: new RegExp('^' + line.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'), headers: [], detach: [] });
    else if (line.trim().startsWith('! ')) rules.at(-1)?.detach.push(line.trim().slice(2).trim().toLowerCase());
    else rules.at(-1)?.headers.push(line.trim().split(/:\s*(.*)/s).slice(0, 2));
  }
  return rules;
}
function parseRedirects(file) {
  if (!existsSync(file)) return new Map();
  return new Map(
    readFileSync(file, 'utf8').split('\n').filter((l) => l.trim() && !l.trim().startsWith('#')).map((l) => {
      const [from, to, status = '302'] = l.trim().split(/\s+/);
      return [from, { to, status: Number(status) }];
    }),
  );
}
const headerRules = parseHeaders(join(root, '_headers'));
const redirects = parseRedirects(join(root, '_redirects'));

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const redirect = redirects.get(path);
  if (redirect) {
    res.writeHead(redirect.status, { Location: redirect.to }).end();
    return;
  }
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) return void res.writeHead(400).end();
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!path.endsWith('/')) return void res.writeHead(308, { Location: path + '/' }).end();
    file = join(file, 'index.html');
  }
  let status = 200;
  if (!existsSync(file)) {
    status = 404;
    file = join(root, '404.html');
  }
  const headers = { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' };
  const matching = headerRules.filter((rule) => rule.re.test(path));
  const detached = new Set(matching.flatMap((rule) => rule.detach));
  for (const rule of matching) {
    for (const [k, v] of rule.headers) {
      if (detached.has(k.toLowerCase())) continue;
      headers[k] = k in headers && k !== 'Content-Type' ? `${headers[k]}, ${v}` : v;
    }
  }
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : readFileSync(file));
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${port}/`));
