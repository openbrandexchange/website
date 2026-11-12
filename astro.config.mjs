import { defineConfig } from 'astro/config';

// Static site, deployable to Cloudflare Pages (see scripts/deploy-cloudflare-pages.sh).
export default defineConfig({
  site: 'https://openbrandexchange.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Keep CSS in files so the Content-Security-Policy can stay strict (style-src 'self').
    inlineStylesheets: 'never',
  },
  // Never inline assets as data: URIs: small font subsets would otherwise be inlined, and the
  // Content-Security-Policy allows fonts from 'self' only.
  vite: { build: { assetsInlineLimit: 0 } },
  // No Astro dev toolbar in production builds, no telemetry needed for a static site.
  devToolbar: { enabled: false },
});
