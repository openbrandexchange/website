#!/bin/sh
# Deploy openbrandexchange.com to Cloudflare Pages.
#
# Needs Bun and Node 22.18+ and either `bunx wrangler login` once on this machine, or CLOUDFLARE_API_TOKEN
# (scope: Account > Cloudflare Pages > Edit) + CLOUDFLARE_ACCOUNT_ID in the environment.
#
#   sh scripts/deploy-cloudflare-pages.sh                        # production (branch main)
#   CF_PAGES_BRANCH=preview sh scripts/deploy-cloudflare-pages.sh # preview URL
#   DRY_RUN=1 sh scripts/deploy-cloudflare-pages.sh              # build and check only
#
# CF_PAGES_PROJECT (default openbrandexchange) names the Pages project; it is created on the
# first deploy. PUBLIC_CF_ANALYTICS_TOKEN (optional) enables cookieless Web Analytics.
set -eu

PROJECT="${CF_PAGES_PROJECT:-openbrandexchange}"
BRANCH="${CF_PAGES_BRANCH:-main}"
WRANGLER="bunx wrangler@4"

cd "$(dirname "$0")/.."

echo "==> Installing dependencies"
bun install --frozen-lockfile

echo "==> Validating, type-checking, building, checking links and running tests"
bun run check

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "==> DRY_RUN=1: built and checked dist/, not deploying."
  exit 0
fi

if ! $WRANGLER pages project list 2>/dev/null | grep -q "[[:space:]]${PROJECT}[[:space:]]"; then
  echo "==> Creating Cloudflare Pages project '$PROJECT' (production branch main)"
  $WRANGLER pages project create "$PROJECT" --production-branch main
fi

echo "==> Deploying dist/ to Cloudflare Pages project '$PROJECT' (branch '$BRANCH')"
$WRANGLER pages deploy dist --project-name "$PROJECT" --branch "$BRANCH" --commit-dirty=true
