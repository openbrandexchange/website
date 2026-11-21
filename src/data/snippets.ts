// Copy-paste snippets shared by the Dutch and English pages. They follow the
// spec (docs/automation.md, docs/import-format.md, docs/protocol.md) and use the
// fictional fashion house MAISON NOOR (MAISON NOOR Group) at brands.maison-noor.example.

export const env = `export OBX_URL=https://brands.maison-noor.example
export OBX_TOKEN=obxi_…   # admin → Automatic upload → Access keys (shown once)`;

export const cliBasics = `obx info                                            # check the token, see limits and brands
obx push --csv products.csv --images ./images       # publish a CSV and a folder (or zip) of images
obx push --package export.zip                       # the same, as one zip
obx push --csv products.csv --images ./images --mirror   # also take offline what is no longer in the file
obx push --csv products.csv --images ./images --dry-run  # only check, change nothing
obx watch ./outbox                                  # keep publishing whatever lands in a folder
obx status                                          # recent jobs and their errors`;

export const csvExample = `brand,style_number,name:en,name:nl,item_type,season,materials,color_code,color_name:en,size,gtin
MAISON NOOR,MN-1001,Fine Merino Crew-Neck Sweater,Fijne merino trui met ronde hals,sweater,AW26,main: 100% merino_wool,NVY,Navy,S,2000100101018
MAISON NOOR,MN-1001,Fine Merino Crew-Neck Sweater,Fijne merino trui met ronde hals,sweater,AW26,main: 100% merino_wool,NVY,Navy,M,2000100101025`;

export const fileNames = `images/
  MN-1001_NVY_1.jpg     ← style MN-1001, colour NVY, position 1 (front)
  MN-1001_NVY_2.jpg
  MN-1001_NVY_3.jpg`;

export const watchService = `# /etc/systemd/system/obx-watch.service
[Unit]
Description=obx watch: publish exports from /data/outbox
After=network-online.target
Wants=network-online.target

[Service]
Environment=OBX_URL=https://brands.maison-noor.example
Environment=OBX_TOKEN=obxi_…
ExecStart=/usr/local/bin/obx watch /data/outbox
Restart=always

[Install]
WantedBy=multi-user.target

# then: sudo systemctl enable --now obx-watch`;

export const cron = `# crontab -e: every night at 02:30
30 2 * * * OBX_URL=https://brands.maison-noor.example OBX_TOKEN=obxi_… /usr/local/bin/obx push --csv /exports/products.csv --images /exports/images >> /var/log/obx.log 2>&1`;

export const windowsTask = `$action = New-ScheduledTaskAction -Execute "C:\\Tools\\obx.exe" -Argument "push --csv D:\\Export\\products.csv --images D:\\Export\\images"
$trigger = New-ScheduledTaskTrigger -Daily -At 2:30am
[Environment]::SetEnvironmentVariable("OBX_URL", "https://brands.maison-noor.example", "Machine")
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

export const httpProduct = `PUT {OBX_URL}/obx/v1/ingest/products/MN-1001
Authorization: Bearer obxi_…
Content-Type: application/json

{"style_number": "MN-1001",
 "name": {"en": "Fine Merino Crew-Neck Sweater", "nl": "Fijne merino trui met ronde hals"},
 "item_type": "sweater", "season": "AW26",
 "materials": [{"part": {"code": "main"},
                "fibers": [{"material": {"code": "merino_wool"}, "percentage": 100, "qualifiers": []}]}]}`;

export const httpVariant = `PUT {OBX_URL}/obx/v1/ingest/variants/MN-1001-NVY-M
Authorization: Bearer obxi_…
Content-Type: application/json

{"product_external_id": "MN-1001", "gtin": "2000100101025",
 "color": {"code": "NVY", "name": {"en": "Navy"}}, "size": "M"}`;

export const httpImage = `PUT {OBX_URL}/obx/v1/ingest/assets/MN-1001_NVY_1
Authorization: Bearer obxi_…
Content-Type: application/json

{"product_external_id": "MN-1001", "color_code": "NVY",
 "role": "packshot", "view": "front", "position": 1}

PUT {OBX_URL}/obx/v1/ingest/assets/MN-1001_NVY_1/files/original
Authorization: Bearer obxi_…
Content-Type: image/jpeg

<the image file as binary body>`;

export const httpUnpublish = `PATCH {OBX_URL}/obx/v1/ingest/products/MN-1001
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
{"op":"upsert","kind":"product","external_id":"MN-1001","data":{"style_number":"MN-1001","name":{"en":"Fine Merino Crew-Neck Sweater"}}}
{"op":"upsert","kind":"variant","external_id":"MN-1001-NVY-M","data":{"product_external_id":"MN-1001","gtin":"2000100101025","color":{"code":"NVY"},"size":"M"}}
{"op":"unpublish","kind":"product","external_id":"MN-0999"}
EOF
curl -s -X POST -H "$AUTH" -H 'Content-Type: application/x-ndjson' \\
  -H "Idempotency-Key: nightly-$(date +%F)" --data-binary @batch.ndjson "$URL/batch"`;

export const retailerCurl = `HOST=https://brands.maison-noor.example
curl -s $HOST/.well-known/obx                       # what does this brand offer?
TOKEN=$(curl -s -u "$CLIENT_ID:$CLIENT_SECRET" -d grant_type=client_credentials \\
  $HOST/obx/v1/oauth/token | jq -r .access_token)
curl -s -H "Authorization: Bearer $TOKEN" "$HOST/obx/v1/changes?limit=500"   # everything, then only changes
curl -s -H "Authorization: Bearer $TOKEN" -X POST -H 'Content-Type: application/json' \\
  -d '{"gtins":["2000100101025"]}' "$HOST/obx/v1/products:by-gtin"
# or let the obx tool keep a copy in a folder, only fetching what changed:
OBX_CLIENT_ID=$CLIENT_ID OBX_CLIENT_SECRET=$CLIENT_SECRET obx pull $HOST --out ./maison-noor`;

// The one-line installer (node-go/install.sh, attached to every node-go release; the website
// redirects /install.sh to the latest one in public/_redirects). The domain is the page's example.
export const installCmd = (domain: string, extra = '') =>
  `curl -fsSL https://openbrandexchange.com/install.sh | sudo sh -s -- --domain ${domain}${extra}`;

export const digCheck = (domain: string) => `dig +short ${domain}`;

export const installOptions = ['--domain NAME', '--email ADDRESS', '--version X.Y.Z', '--edition go|ts', '--behind-proxy', '--dry-run', '--uninstall'];

export const serverFiles: [string, string][] = [
  ['/usr/local/bin/node-go', '/opt/obx-portal'],
  ['/var/lib/node-go', '/var/lib/obx-portal'],
  ['/etc/node-go/node-go.env', '/etc/obx-portal/obx-portal.env'],
  ['node-go', 'obx-portal'],
];

export const serverCommands = (domain: string) => `sudo systemctl status node-go                     # is it running? (TypeScript edition: obx-portal)
sudo journalctl -u node-go -f                     # follow the log
sudo journalctl -u node-go | grep "setup code"    # the one-time setup code again
sudo grep OBX_SETUP_CODE /etc/node-go/node-go.env # ... or from the settings file

# update: the same command again (keeps settings and data)
curl -fsSL https://openbrandexchange.com/install.sh | sudo sh -s -- --domain ${domain}

# remove the program and the service; data and settings stay (add --purge to delete them)
curl -fsSL https://openbrandexchange.com/install.sh | sudo sh -s -- --uninstall`;

// node-go/docs/hosting/linux.md: a nightly node-go backup from cron, copied off the server.
export const serverBackup = `# /etc/cron.d/node-go-backup: a consistent copy every night at 03:15, while the portal keeps running
15 3 * * * root sh -c 'set -a; . /etc/node-go/node-go.env; exec runuser -u obx -- /usr/local/bin/node-go backup --to /var/lib/node-go/backups/'"$(date +\\%F)" >/dev/null

# copy one off the server now and then (or sync it to a bucket)
scp -r root@<server-ip>:/var/lib/node-go/backups/2026-11-17 ./portal-backup-2026-11-17`;

export const cfCli = `git clone https://github.com/openbrandexchange/node-ts && cd node-ts
bun install
bunx wrangler login
bunx wrangler secret put OBX_SECRET_KEY      # paste the output of: openssl rand -base64 48
bunx wrangler secret put OBX_SETUP_CODE      # a code you choose, for the setup wizard
bun run deploy                               # Worker + D1 database + R2 bucket + cron, then the tables

# backups outside Cloudflare: export the database regularly
bunx wrangler d1 export brand-portal-db --remote --output=portal-$(date +%F).sql`;

export const conformance = `obx-conformance all --url http://localhost:8080 --setup-code …   # a fresh portal: setup, fixtures, every profile
obx-conformance protocol --url https://brands.maison-noor.example --client-id obxc_… --client-secret obxs_…
obx-conformance mock                                              # a mock server that passes everything`;

export const discovery = `$ curl https://brands.maison-noor.example/.well-known/obx`;
export const discoveryResponse = `{
  "obx_version": "0.3",
  "spec_version": "0.3.0",
  "publisher": { "name": "MAISON NOOR Group" },
  "api_base": "https://brands.maison-noor.example/obx/v1",
  "portal_url": "https://brands.maison-noor.example/",
  "capabilities": ["changes", "products", "by_gtin",
                   "renditions", "exports", "webhooks"]
}`;

// The public demo portal (node-ts in demo mode, docs/demo.md there): fictional data, reset every hour.
// Its test key is published on purpose and can only read.
export const DEMO_URL = 'https://obx-portal-demo.richardlindhout96.workers.dev';
export const DEMO_CLIENT_ID = 'obxc_demo-portal-read-only';
export const DEMO_CLIENT_SECRET = 'obxs_demo-portal-read-only-public';
export const demoCurl = `HOST=${DEMO_URL}
CLIENT_ID=${DEMO_CLIENT_ID}
CLIENT_SECRET=${DEMO_CLIENT_SECRET}
TOKEN=$(curl -s -u "$CLIENT_ID:$CLIENT_SECRET" -d grant_type=client_credentials \\
  $HOST/obx/v1/oauth/token | jq -r .access_token)
curl -s -H "Authorization: Bearer $TOKEN" "$HOST/obx/v1/changes?limit=500" | jq '{phase, has_more, n: (.changes | length)}'
curl -s -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \\
  -d '{"gtins": ["2000100801017", "2000100101025"]}' "$HOST/obx/v1/products:by-gtin"`;
