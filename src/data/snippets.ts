// Copy-paste snippets shared by the Dutch and English pages. They follow the
// spec (docs/automation.md, docs/import-format.md, docs/protocol.md) and use the
// fictional brand "Kestrel Outfitters" at brands.kestrel.example.

export const env = `export OBX_URL=https://brands.kestrel.example
export OBX_TOKEN=obxi_…   # admin → Automatic upload → Access keys (shown once)`;

export const cliBasics = `obx info                                            # check the token, see limits and brands
obx push --csv products.csv --images ./images       # publish a CSV and a folder (or zip) of images
obx push --package export.zip                       # the same, as one zip
obx push --csv products.csv --images ./images --mirror   # also take offline what is no longer in the file
obx push --csv products.csv --images ./images --dry-run  # only check, change nothing
obx watch ./outbox                                  # keep publishing whatever lands in a folder
obx status                                          # recent jobs and their errors`;

export const csvExample = `brand,style_number,name:en,name:nl,item_type,season,materials,color_code,color_name:en,size,gtin
Kestrel,KO-1001,Merino Crew Sweater,Merino trui met ronde hals,sweater,AW26,main: 100% merino_wool,NVY,Navy,S,2000100101018
Kestrel,KO-1001,Merino Crew Sweater,Merino trui met ronde hals,sweater,AW26,main: 100% merino_wool,NVY,Navy,M,2000100101025`;

export const fileNames = `images/
  KO-1001_NVY_1.jpg     ← style KO-1001, colour NVY, position 1 (front)
  KO-1001_NVY_2.jpg
  KO-1001_NVY_3.jpg`;

export const watchDocker = `docker run -d --restart unless-stopped \\
  -e OBX_URL -e OBX_TOKEN \\
  -v /data/outbox:/outbox \\
  ghcr.io/openbrandexchange/obx watch /outbox`;

export const cron = `# crontab -e: every night at 02:30
30 2 * * * OBX_URL=https://brands.kestrel.example OBX_TOKEN=obxi_… /usr/local/bin/obx push --csv /exports/products.csv --images /exports/images >> /var/log/obx.log 2>&1`;

export const windowsTask = `$action = New-ScheduledTaskAction -Execute "C:\\Tools\\obx.exe" -Argument "push --csv D:\\Export\\products.csv --images D:\\Export\\images"
$trigger = New-ScheduledTaskTrigger -Daily -At 2:30am
[Environment]::SetEnvironmentVariable("OBX_URL", "https://brands.kestrel.example", "Machine")
[Environment]::SetEnvironmentVariable("OBX_TOKEN", "obxi_…", "Machine")
Register-ScheduledTask -TaskName "Publish to OBX" -Action $action -Trigger $trigger -User "SYSTEM"`;

export const githubAction = `# .github/workflows/publish.yml  (secrets: OBX_URL, OBX_TOKEN)
name: Publish product content
on:
  push:
    branches: [main]
    paths: ["export/**"]
  schedule:
    - cron: "30 2 * * *"
  workflow_dispatch:
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install obx
        run: |
          curl -fsSL https://github.com/openbrandexchange/obx-go/releases/latest/download/obx_linux_amd64.tar.gz | tar -xz obx
          sudo mv obx /usr/local/bin/
      - name: Publish
        env:
          OBX_URL: \${{ secrets.OBX_URL }}
          OBX_TOKEN: \${{ secrets.OBX_TOKEN }}
        run: obx push --csv export/products.csv --assets-csv export/assets.csv --images export/images`;

export const httpProduct = `PUT {OBX_URL}/obx/v1/ingest/products/KO-1001
Authorization: Bearer obxi_…
Content-Type: application/json

{"style_number": "KO-1001",
 "name": {"en": "Merino Crew Sweater", "nl": "Merino trui met ronde hals"},
 "item_type": "sweater", "season": "AW26",
 "materials": [{"part": "main", "fibers": [{"fiber": "merino_wool", "percentage": 100}]}]}`;

export const httpVariant = `PUT {OBX_URL}/obx/v1/ingest/variants/2000100101025
Authorization: Bearer obxi_…
Content-Type: application/json

{"product_external_id": "KO-1001", "gtin": "2000100101025",
 "color": {"code": "NVY", "name": {"en": "Navy"}}, "size": "M"}`;

export const httpImage = `PUT {OBX_URL}/obx/v1/ingest/assets/KO-1001_NVY_1
Authorization: Bearer obxi_…
Content-Type: application/json

{"product_external_id": "KO-1001", "color_code": "NVY",
 "role": "packshot", "view": "front", "position": 1}

PUT {OBX_URL}/obx/v1/ingest/assets/KO-1001_NVY_1/files/original
Authorization: Bearer obxi_…
Content-Type: image/jpeg

<the image file as binary body>`;

export const httpUnpublish = `PATCH {OBX_URL}/obx/v1/ingest/products/KO-1001
Authorization: Bearer obxi_…
Content-Type: application/merge-patch+json

{"status": "unpublished"}`;

export const curlImport = `curl -s -X POST -H "Authorization: Bearer $OBX_TOKEN" \\
  -F csv=@products.csv -F images=@images.zip \\
  -F 'options={"mode":"upsert"};type=application/json' \\
  "$OBX_URL/obx/v1/ingest/imports"          # returns a job; poll $OBX_URL/obx/v1/ingest/jobs/<id>`;

export const curlBatch = `URL="$OBX_URL/obx/v1/ingest"; AUTH="Authorization: Bearer $OBX_TOKEN"

# 1. Upload only the images the node does not have yet (addressed by sha256).
for f in images/*.jpg; do
  sha=$(shasum -a 256 "$f" | cut -d' ' -f1)
  curl -sf -I -H "$AUTH" "$URL/blobs/$sha" >/dev/null || \\
    curl -sf -X PUT -H "$AUTH" -H 'Content-Type: image/jpeg' --data-binary @"$f" "$URL/blobs/$sha"
done

# 2. One batch of up to 1000 operations (NDJSON), processed in order.
cat > batch.ndjson <<'EOF'
{"op":"upsert","kind":"product","external_id":"KO-1001","data":{"style_number":"KO-1001","name":{"en":"Merino Crew Sweater"}}}
{"op":"upsert","kind":"variant","external_id":"2000100101025","data":{"product_external_id":"KO-1001","gtin":"2000100101025","color":{"code":"NVY"},"size":"M"}}
{"op":"unpublish","kind":"product","external_id":"KO-0999"}
EOF
curl -s -X POST -H "$AUTH" -H 'Content-Type: application/x-ndjson' \\
  -H "Idempotency-Key: nightly-$(date +%F)" --data-binary @batch.ndjson "$URL/batch"`;

export const retailerCurl = `HOST=https://brands.kestrel.example
curl -s $HOST/.well-known/obx                       # what does this brand offer?
TOKEN=$(curl -s -u "$CLIENT_ID:$CLIENT_SECRET" -d grant_type=client_credentials \\
  $HOST/obx/v1/oauth/token | jq -r .access_token)
curl -s -H "Authorization: Bearer $TOKEN" "$HOST/obx/v1/changes?limit=500"   # everything, then only changes
curl -s -H "Authorization: Bearer $TOKEN" -X POST -H 'Content-Type: application/json' \\
  -d '{"gtins":["2000100101025"]}' "$HOST/obx/v1/products:by-gtin"
# or let the obx tool keep a copy in a folder, only fetching what changed:
OBX_CLIENT_ID=$CLIENT_ID OBX_CLIENT_SECRET=$CLIENT_SECRET obx pull $HOST --out ./kestrel`;

export const dockerRun = `openssl rand -hex 32 > obx-secret.key      # once; keep this file safe, with your backups
docker run -d --name obx --restart unless-stopped \\
  -p 8080:8080 -v obx-data:/data \\
  -e OBX_PUBLIC_URL=https://brands.example.com \\
  -e OBX_SECRET_KEY="$(cat obx-secret.key)" \\
  ghcr.io/openbrandexchange/node-go

docker logs obx 2>&1 | grep -i "setup code"      # the one-time code for the first-run wizard`;

export const dockerCompose = `# compose.yaml: the node behind Caddy, which gets an HTTPS certificate by itself.
services:
  obx:
    image: ghcr.io/openbrandexchange/node-go
    restart: unless-stopped
    environment:
      OBX_PUBLIC_URL: https://brands.example.com
      OBX_SECRET_KEY: \${OBX_SECRET_KEY}      # openssl rand -hex 32, keep it safe
      OBX_TRUST_PROXY: "true"               # every request comes through Caddy (rate limits per visitor)
    volumes:
      - obx-data:/data
  caddy:
    image: caddy:2
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    command: caddy reverse-proxy --from brands.example.com --to obx:8080
    volumes:
      - caddy-data:/data
volumes:
  obx-data:
  caddy-data:`;

export const cloudRun = `git clone https://github.com/openbrandexchange/node-go
cd node-go
gcloud config set project my-project   # once: your Google Cloud project (billing on)
DRY_RUN=1 ./deploy/cloudrun.sh         # optional: only show what it would do, change nothing
./deploy/cloudrun.sh                   # region europe-west4; REGION=… for another`;

export const conformance = `obx-conformance all --url http://localhost:8080 --setup-code …   # a fresh portal: setup, fixtures, every profile
obx-conformance protocol --url https://brands.kestrel.example --client-id obxc_… --client-secret obxs_…
obx-conformance mock                                              # a mock server that passes everything`;

// Short samples for the marketing pages (highlighted by src/lib/highlight.ts). Shapes follow the
// spec's fixtures (fixtures/examples/ChangesPage.live.json, fixtures/expected/asset-ai-generated.json).
export const heroChanges = `{
  "phase": "live",
  "changes": [
    { "seq": 1042, "op": "delete",
      "type": "asset",
      "external_id": "KO-1001_NVY_2" },
    { "seq": 1043, "op": "upsert",
      "type": "variant",
      "external_id": "2000100101025",
      "data": { "size": "M", … } }
  ],
  "has_more": false
}`;

export const assetChange = `{
  "seq": 1051, "type": "asset", "op": "upsert",
  "external_id": "KO-1003_RST_3",
  "data": {
    "role": "model",
    "color_code": "RST",
    "rights": {
      "license": "retailer-use",
      "channels": ["webshop", "marketplace", "social"],
      "embargo_until": null
    },
    "provenance": { "ai_generated": true, "source": "generated" },
    "renditions": {
      "web":    { "width": 1200, "height": 1500 },
      "square": { "width": 1500, "height": 1500 },
      "thumb":  { "width": 480,  "height": 600 }
    }
  }
}`;

export const pushTerminal = `$ obx push ./export
Publishing to brands.kestrel.example (Kestrel, Kestrel Trail)
images: 27 checked, 3 uploaded (4.2 MB) in 3s
Done: rows: 40, images: 27 → new: 2 · updated: 3 · unchanged: 35`;

export const pushAction = `# .github/workflows/publish.yml
on:
  push:
    paths: ["export/**"]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: openbrandexchange/obx-go/push-action@v0
        with:
          url: \${{ secrets.OBX_URL }}
          token: \${{ secrets.OBX_TOKEN }}
          folder: export`;

export const discovery = `$ curl https://brands.kestrel.example/.well-known/obx`;
export const discoveryResponse = `{
  "obx_version": "0.1",
  "publisher": { "name": "Kestrel Outfitters" },
  "api_base": "https://brands.kestrel.example/obx/v1",
  "portal_url": "https://brands.kestrel.example/",
  "capabilities": ["changes", "products", "by_gtin",
                   "renditions", "exports", "webhooks"]
}`;
