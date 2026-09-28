#!/usr/bin/env sh
# Builds public/downloads/kestrel-example.zip from the specification's Kestrel fixtures, so the
# Downloads page offers them as one file (the GitHub folder is no download for a non-developer).
# Usage: scripts/build-example-zip.sh [path-to-spec]   (default ../spec). Deterministic: fixed file
# dates and order, so the zip only changes when the fixtures do. images.json (test metadata) is left out.
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SPEC="${1:-$ROOT/../spec}"
SRC="$SPEC/fixtures/kestrel"
[ -f "$SRC/products.csv" ] || { echo "error: $SRC/products.csv not found" >&2; exit 1; }
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT INT TERM
mkdir -p "$TMP/kestrel-example/images"
cp "$SRC/products.csv" "$SRC/assets.csv" "$TMP/kestrel-example/"
cp "$SRC"/images/* "$TMP/kestrel-example/images/"
find "$TMP/kestrel-example" -exec touch -t 202601010000 {} +
OUT="$ROOT/public/downloads/kestrel-example.zip"
rm -f "$OUT"
(cd "$TMP" && find kestrel-example | LC_ALL=C sort | zip -q -X -D "$OUT" -@)
echo "wrote $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes)"
