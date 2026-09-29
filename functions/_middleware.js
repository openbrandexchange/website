// Preview lock for openbrandexchange.com on Cloudflare Pages.
//
// Until launch the whole site sits behind HTTP Basic auth. It fails closed:
// without PREVIEW_PASSWORD the site answers 503 instead of going public.
// Launch = set the plain variable PUBLIC_LAUNCH=true (or delete this file).
//
//   npx wrangler pages secret put PREVIEW_PASSWORD --project-name openbrandexchange

const REALM = 'Open Brand Exchange preview';

function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diff === 0;
}

export async function onRequest({ request, env, next }) {
  if (env.PUBLIC_LAUNCH === 'true') return next();

  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  const password = env.PREVIEW_PASSWORD;
  if (!password) {
    return new Response('Open Brand Exchange is not public yet.', { status: 503, headers });
  }

  const auth = request.headers.get('Authorization') || '';
  if (auth.startsWith('Basic ')) {
    let decoded = '';
    try { decoded = atob(auth.slice(6)); } catch { decoded = ''; }
    const given = decoded.slice(decoded.indexOf(':') + 1);
    if (timingSafeEqual(given, password)) {
      const res = await next();
      const out = new Response(res.body, res);
      out.headers.set('X-Robots-Tag', 'noindex, nofollow');
      out.headers.set('Cache-Control', 'private, no-store');
      return out;
    }
  }
  return new Response('Password required.', {
    status: 401,
    headers: { ...headers, 'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"` },
  });
}
