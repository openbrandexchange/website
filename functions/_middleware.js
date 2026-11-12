// www.openbrandexchange.com redirects to the apex domain (one address per page for search
// engines and for the canonical links). Everything else passes through unchanged.
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === 'www.openbrandexchange.com') {
    url.hostname = 'openbrandexchange.com';
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
