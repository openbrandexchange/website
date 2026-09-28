#!/bin/sh
# Deploy openbrandexchange.com to Cloudflare Pages.
#
# Needs: Node 22+, a Cloudflare account, and either `npx wrangler login` once on this machine
# or CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID in the environment (token scope: Pages Edit).
#
#   CF_PAGES_PROJECT=openbrandexchange sh scripts/deploy-cloudflare-pages.sh           # production
#   CF_PAGES_PROJECT=openbrandexchange CF_PAGES_BRANCH=preview sh scripts/deploy-...   # preview URL
#
# Optional: PUBLIC_CF_ANALYTICS_TOKEN enables cookieless Cloudflare Web Analytics at build time.
set -eu

PROJECT="${CF_PAGES_PROJECT:-openbrandexchange}"
BRANCH="${CF_PAGES_BRANCH:-main}"

cd "$(dirname "$0")/.."

echo "==> Installing dependencies"
npm ci

echo "==> Validating, building and checking links"
npm run check

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "==> DRY_RUN=1: built and checked dist/, not deploying."
  exit 0
fi

echo "==> Deploying dist/ to Cloudflare Pages project '$PROJECT' (branch '$BRANCH')"
# Creates the project on first use; answer the prompt or create it in the dashboard first.
npx --yes wrangler@4 pages deploy dist --project-name "$PROJECT" --branch "$BRANCH"
