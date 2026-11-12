// /api/check: the online compatibility check (see /<lang>/check/).
// Passes the request to the obx-checker Worker over the CHECKER service binding
// (wrangler.toml); that Worker verifies Turnstile, applies the limits, runs the
// check in a container in the EU and stores shareable reports in the EU. The
// body, with the optional test client secret, is passed on as is and never
// logged here.

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function onRequest({ request, env }) {
  if (!env.CHECKER) return json(503, { error: { code: 'unavailable', message: 'The checker is not available right now.' } });
  const url = new URL(request.url);
  if (request.method === 'GET') {
    const id = url.searchParams.get('id') || '';
    return env.CHECKER.fetch(`https://checker/check?id=${encodeURIComponent(id)}`);
  }
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } });
  }
  const type = request.headers.get('Content-Type') || '';
  if (!type.startsWith('application/json')) {
    return json(415, { error: { code: 'bad_request', message: 'Send JSON.' } });
  }
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > 16 * 1024) return json(413, { error: { code: 'bad_request', message: 'The request is too large.' } });
  const headers = {
    'Content-Type': 'application/json',
    'X-OBX-Client-IP': request.headers.get('CF-Connecting-IP') || 'unknown',
  };
  const operator = request.headers.get('X-OBX-Operator');
  if (operator) headers['X-OBX-Operator'] = operator;
  return env.CHECKER.fetch('https://checker/check', { method: 'POST', headers, body: request.body });
}
