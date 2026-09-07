# Deploy imprintID Apps on AWS

This guide covers hosting the Vite/React app on AWS with HTTPS and a custom domain such as **`imprintid.apps.com`**.

> **Domain note:** You must control DNS for the parent domain (`apps.com` for `imprintid.apps.com`). If you own **imprintid.com** instead, use something like `apps.imprintid.com` — the steps are the same; only the domain name changes.

---

## What you are deploying

| Item | Detail |
|------|--------|
| App type | Static SPA (React + Vite) |
| Build output | `dist/` |
| SPA routing | Client-side (`react-router-dom`) — needs fallback to `index.html` |
| Existing infra | `infra/cloudformation.yaml` + `scripts/deploy.sh` |
| Optional CI | `amplify.yml` (AWS Amplify Hosting) |

**Recommended path:** **S3 + CloudFront + ACM + Route 53** (already wired in this repo).

**Alternative:** **AWS Amplify Hosting** (simpler UI; good if you want Git-based deploys).

---

## Architecture (recommended)

```
User → https://imprintid.apps.com
         → Route 53 (DNS A/AAAA alias)
         → CloudFront (HTTPS, CDN, SPA fallback)
         → S3 bucket (private; CloudFront Origin Access Control)
```

TLS certificate is issued by **ACM in `us-east-1`** (required for CloudFront).

---

## Prerequisites

1. AWS account with permissions for S3, CloudFront, ACM, CloudFormation, and Route 53 (or ability to create DNS records elsewhere).
2. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and configured:

   ```bash
   aws configure
   aws sts get-caller-identity
   ```

3. Node.js 18+ and npm for local builds.
4. Control of DNS for the domain you will use.

---

## Option A — S3 + CloudFront (recommended)

### Step 1 — Decide the domain

Examples:

- `imprintid.apps.com` (if you manage `apps.com`)
- `apps.imprintid.com` (if you manage `imprintid.com`)

Below we use **`imprintid.apps.com`**. Replace it everywhere if yours differs.

### Step 2 — Request an ACM certificate (us-east-1)

CloudFront only accepts ACM certs from **US East (N. Virginia)**.

```bash
aws acm request-certificate \
  --region us-east-1 \
  --domain-name imprintid.apps.com \
  --validation-method DNS \
  --subject-alternative-names www.imprintid.apps.com
```

Save the **Certificate ARN** from the output.

### Step 3 — Validate the certificate in DNS

1. In ACM console (region **us-east-1**) open the certificate.
2. Copy the **CNAME name** and **CNAME value** for DNS validation.
3. Create that CNAME at your DNS provider (Route 53 or wherever `apps.com` is hosted).
4. Wait until status is **Issued** (often a few minutes).

If the parent domain is in Route 53:

```bash
# Example — replace Name/Value with ACM-provided records
aws route53 change-resource-record-sets \
  --hosted-zone-id ZXXXXXXXXXXXXX \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "_abc123.imprintid.apps.com.",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{ "Value": "_xyz.acm-validations.aws." }]
      }
    }]
  }'
```

### Step 4 — Create the S3 + CloudFront stack

From the project root:

```bash
export AWS_REGION=us-east-1
export STACK_NAME=imprintid-apps
export DOMAIN_NAME=imprintid.apps.com
export ACM_CERT_ARN=arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID

chmod +x scripts/deploy.sh
./scripts/deploy.sh bootstrap
```

This deploys `infra/cloudformation.yaml` and creates:

- Private S3 bucket for static files
- CloudFront distribution with HTTPS
- Origin Access Control (bucket is not public)
- Custom domain alias (when `DOMAIN_NAME` + `ACM_CERT_ARN` are set)

Note the outputs: **BucketName**, **DistributionId**, **DistributionDomainName**, **WebsiteURL**.

### Step 5 — Point DNS at CloudFront

Create an **alias** (Route 53) or **CNAME** to the CloudFront domain (e.g. `d111111abcdef8.cloudfront.net`).

#### Route 53 alias (preferred)

1. Open the hosted zone for `apps.com`.
2. Create record:
   - **Name:** `imprintid`
   - **Type:** A — Alias to CloudFront distribution
   - Select your distribution
3. Optional: same for `www.imprintid` if you included it on the cert.

#### Non–Route 53 DNS

Create a **CNAME**:

| Host | Type | Value |
|------|------|--------|
| `imprintid` | CNAME | `d111111abcdef8.cloudfront.net` |

Some providers also support ALIAS/ANAME at apex; for a subdomain like `imprintid.apps.com`, CNAME is fine.

Wait for DNS propagation (minutes to a few hours). Test:

```bash
dig imprintid.apps.com +short
curl -I https://imprintid.apps.com
```

### Step 6 — Build and upload the app

```bash
./scripts/deploy.sh sync
```

This will:

1. Run `npm run build`
2. Sync `dist/` to S3 (long cache for assets, short cache for `index.html`)
3. Invalidate CloudFront (`/*`)

First-time full flow:

```bash
DOMAIN_NAME=imprintid.apps.com \
ACM_CERT_ARN=arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID \
./scripts/deploy.sh all
```

### Step 7 — Verify

Open:

- Temporary CloudFront URL from stack output
- `https://imprintid.apps.com`

Check:

- Login page loads
- Deep links work (e.g. `/reports`, `/tools/artwork-library`) — SPA fallback must serve `index.html`
- HTTPS lock icon is valid

---

## Option B — AWS Amplify Hosting (Git-based)

Use this if you prefer console-driven deploys from GitHub/GitLab/Bitbucket. The repo already includes `amplify.yml`.

### Steps

1. AWS Console → **Amplify** → **Host web app** → connect repository.
2. Amplify detects `amplify.yml` (build → `dist`).
3. Deploy; note the default `*.amplifyapp.com` URL.
4. **Domain management** → add `imprintid.apps.com`.
5. Amplify shows DNS records (usually a CNAME). Add them at your DNS provider.
6. Amplify provisions/validates the certificate automatically.

Rewrites for SPA (Amplify console → Rewrites and redirects), if not already present:

| Source | Target | Type |
|--------|--------|------|
| `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json\|webp)$)([^.]+$)/>` | `/index.html` | 200 (Rewrite) |

Or a simple rule: all 404s → `/index.html` (200).

---

## Custom domain checklist

- [ ] Domain chosen (`imprintid.apps.com` or `apps.imprintid.com`)
- [ ] You control parent-zone DNS
- [ ] ACM certificate in **us-east-1** is **Issued**
- [ ] CloudFront (or Amplify) attached to that certificate
- [ ] DNS A/AAAA alias or CNAME points to CloudFront / Amplify
- [ ] `https://your-domain` loads the app
- [ ] Client routes (refresh on `/reports`) work

---

## Updating the site after code changes

```bash
./scripts/deploy.sh sync
```

Or, with Amplify: push to the connected branch.

---

## SPA routing (React Router)

CloudFront must return `index.html` for unknown paths so `/reports/...` works on refresh.

The stack in `infra/cloudformation.yaml` already maps 403/404 to `/index.html`. If deep links fail after deploy, confirm those custom error responses exist on the distribution, or switch Amplify to a **200 rewrite** to `/index.html`.

---

## Consumables email API on AWS

`/api/send-low-stock` is a **Vercel-style serverless** function (`api/send-low-stock.js`). Plain S3 + CloudFront does **not** run it.

Options:

1. Keep the static site on CloudFront and move the API to **API Gateway + Lambda** (or Amplify Functions).
2. Host on **Amplify** and add a backend function for the same route.
3. Keep email alerts on Vercel while the UI is on AWS (not ideal).

Until that API is migrated, low-stock email from the Consumables tool will not work on a static-only AWS deploy.

---

## Costs (ballpark)

For a small internal app:

| Service | Typical cost |
|---------|----------------|
| S3 storage + requests | Cents to a few dollars/month |
| CloudFront | Free tier then low traffic cost |
| Route 53 hosted zone | ~$0.50/month per zone + queries |
| ACM certificate | Free |
| Amplify Hosting | Free tier then usage-based |

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| Certificate stuck Pending | DNS validation CNAME missing or wrong zone |
| `NET::ERR_CERT_*` | Cert does not include the hostname, or still using wrong CloudFront cert |
| Domain not resolving | CNAME/alias not created or not propagated (`dig`) |
| 403 on site | Stack/bootstrap incomplete, or sync not run |
| Blank page / wrong assets | Hard refresh; confirm `dist/` uploaded; check CloudFront invalidation |
| Refresh on `/reports` fails | SPA error responses / Amplify rewrite missing |
| `/api/send-low-stock` 404 | Expected on static S3/CloudFront until API is migrated |

---

## Quick command reference

```bash
# Build only
npm ci && npm run build

# Create infra (optional domain)
DOMAIN_NAME=imprintid.apps.com \
ACM_CERT_ARN=arn:aws:acm:us-east-1:ACCOUNT:certificate/ID \
./scripts/deploy.sh bootstrap

# Publish build
./scripts/deploy.sh sync

# Infra + publish
DOMAIN_NAME=imprintid.apps.com \
ACM_CERT_ARN=arn:aws:acm:us-east-1:ACCOUNT:certificate/ID \
./scripts/deploy.sh all
```

---

## Related files

| File | Purpose |
|------|---------|
| `infra/cloudformation.yaml` | S3 + CloudFront template |
| `scripts/deploy.sh` | Bootstrap stack + sync `dist/` |
| `amplify.yml` | Amplify build spec |
| `vercel.json` | Current Vercel config (SPA + API) |
