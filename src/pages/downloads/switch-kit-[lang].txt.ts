import type { APIRoute } from 'astro';
import { langs, type Lang } from '../../i18n';
import { switchKit } from '../../lib/switch-kit';

export function getStaticPaths() {
  return langs.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) =>
  new Response(switchKit(params.lang as Lang).text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
