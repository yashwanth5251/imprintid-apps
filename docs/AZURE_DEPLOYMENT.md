# Deploy imprintID Apps to Azure Web Apps

This app is a **Vite + React SPA** with a small **Node/Express API** (`/api/send-low-stock`) for consumables email alerts. That shape fits **Azure App Service (Web App) on Linux + Node 20**.

It aligns with your Azure footprint (Business Central / Dynamics 365) so you can keep apps, identity, networking, and monitoring in one cloud.

---

## Recommended architecture

| Piece | Azure service |
|--------|----------------|
| imprintID Apps (UI + email API) | **App Service Web App** (Linux, Node 20) |
| Custom domain (e.g. `apps.imprintid.com`) | App Service custom domain + TLS |
| Secrets (`RESEND_API_KEY`) | App Service **Application settings** / Key Vault references |
| CI/CD | GitHub Actions (workflow included) or Azure DevOps |
| Optional later | Entra ID auth, App Insights, VNet integration with BC |

**Do not** use plain static hosting alone (Storage static website / basic Static Web Apps without Functions) unless you move the email API elsewhere — the consumables tool needs `/api/send-low-stock`.

---

## What changed in this repo for Azure

| File | Purpose |
|------|---------|
| `server.js` | Production Node server: serves `dist/` + API + SPA routes |
| `server/lowStockEmail.js` | Shared email logic |
| `package.json` → `"start": "node server.js"` | Azure startup command |
| `.env.example` | App settings template |
| `.github/workflows/azure-webapps.yml` | Deploy on push to `main` |
| `web.config` | Only if you use Windows App Service (prefer Linux) |
| `docs/AZURE_DEPLOYMENT.md` | This guide |

Local production test:

```bash
npm install
npm run build
npm start
# open http://localhost:8080
```

---

## Option A — Azure Portal (manual, first deploy)

### 1. Prerequisites

- Azure subscription in the same tenant you use for Dynamics / BC (recommended)
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) **or** Portal only
- GitHub repo: `yashwanth5251/imprintid-apps`
- (Recommended) [Resend](https://resend.com) API key for reliable alert emails

### 2. Create resource group + Web App

**Portal**

1. Create a resource → **Web App**
2. Basics:
   - **Name:** e.g. `imprintid-apps` → URL `https://imprintid-apps.azurewebsites.net`
   - **Publish:** Code
   - **Runtime stack:** Node 20 LTS
   - **Operating System:** **Linux** (recommended)
   - **Region:** same as your other Azure workloads if possible (e.g. East US)
   - **Pricing:** B1 or higher for production; Free F1 is OK for a pilot
3. Create

**CLI equivalent**

```bash
az login
az group create --name rg-imprintid-apps --location eastus

az appservice plan create \
  --name plan-imprintid-apps \
  --resource-group rg-imprintid-apps \
  --sku B1 \
  --is-linux

az webapp create \
  --resource-group rg-imprintid-apps \
  --plan plan-imprintid-apps \
  --name imprintid-apps \
  --runtime "NODE:20-lts"
```

Replace `imprintid-apps` if the name is taken globally.

### 3. Configure App Settings

Portal → Web App → **Configuration** → **Application settings**:

| Name | Value |
|------|--------|
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |
| `NODE_ENV` | `production` |
| `RESEND_API_KEY` | your Resend key |
| `RESEND_FROM_EMAIL` | e.g. `imprintID Apps <noreply@yourdomain.com>` |

Startup command (Portal → **Configuration** → **General settings** → **Startup Command**):

```text
npm start
```

Or explicitly:

```text
node server.js
```

Azure sets `PORT` automatically — `server.js` already reads `process.env.PORT`.

Save and restart the app.

### 4. Deploy code

**A. GitHub Actions (recommended)**

1. Portal → Web App → **Deployment Center** → GitHub → authorize → select `imprintid-apps` / `main`  
   **or** use the included workflow:

2. Download **Publish profile**: Web App → **Get publish profile**

3. In GitHub repo → **Settings** → **Secrets and variables** → **Actions**:
   - Secret `AZURE_WEBAPP_PUBLISH_PROFILE` = full publish profile XML
   - Variable `AZURE_WEBAPP_NAME` = your web app name (e.g. `imprintid-apps`)

4. Push to `main` — workflow builds and deploys.

**B. Zip deploy from your machine**

```bash
npm ci
npm run build

# Zip project (exclude node_modules if Azure builds for you)
# With SCM_DO_BUILD_DURING_DEPLOYMENT=true, Azure runs npm install on the server.
az webapp deploy \
  --resource-group rg-imprintid-apps \
  --name imprintid-apps \
  --src-path . \
  --type zip
```

For zip deploy, Azure Oryx will run `npm install` and detect `npm start`. Ensure `dist/` is either built in CI before zip, or add a custom deploy script that builds on the server.

**Safer pattern for zip:** build locally, then deploy including `dist/` + `node_modules` production deps, or let Oryx build:

Create `.deployment`:

```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

And set App Setting `POST_BUILD_COMMAND` / use Oryx build commands:

```bash
az webapp config appsettings set \
  --resource-group rg-imprintid-apps \
  --name imprintid-apps \
  --settings \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true \
    PRE_BUILD_COMMAND="" \
    POST_BUILD_COMMAND="npm run build"
```

With that, deploy source; Azure installs deps, runs `npm run build`, then `npm start`.

**C. VS Code**

Azure App Service extension → sign in → right-click Web App → Deploy to Web App → select this folder.

### 5. Verify

```bash
curl https://imprintid-apps.azurewebsites.net/api/health
# {"ok":true,"service":"imprintid-apps",...}

# Open in browser
open https://imprintid-apps.azurewebsites.net
```

Login as `admin` / `admin123`, open Consumables Automation, drop an item below threshold, confirm email to `yash@imprintid.com`.

### 6. Custom domain (imprintIDApps.com or apps.imprintid.com)

1. Web App → **Custom domains** → Add  
2. Create DNS at your registrar:
   - **A record** / **TXT** as shown in Portal, **or**
   - **CNAME** `apps` → `imprintid-apps.azurewebsites.net`
3. Enable **App Service Managed Certificate** (free TLS)
4. Set HTTPS Only = On

If `imprintidapps.com` currently points at Vercel, update DNS to Azure when ready (cutover).

---

## Option B — Azure Static Web Apps + Azure Functions (alternative)

Use if you want CDN-style static hosting:

1. Host `dist/` on **Azure Static Web Apps**
2. Move `/api/send-low-stock` to an **Azure Function** (HTTP trigger) in `/api`
3. SWA proxies `/api/*` automatically

This repo’s Express `server.js` path is simpler for one Web App next to BC. Prefer Option A unless you specifically want SWA.

---

## Networking next to Business Central / D365

Later options (not required for day-1):

- Put the Web App in the same region as BC
- **VNet integration** if APIs must stay private
- Replace demo login with **Microsoft Entra ID** (same tenant as Dynamics) — map Entra groups to roles in `src/data/users.js` / AuthContext
- Call Business Central APIs with Entra app registration + OAuth

---

## Environment checklist

| Setting | Required | Notes |
|---------|----------|--------|
| `PORT` | Auto | Set by Azure |
| `NODE_ENV=production` | Recommended | |
| `SCM_DO_BUILD_DURING_DEPLOYMENT=true` | If deploying source | Lets Azure `npm install` + build |
| `POST_BUILD_COMMAND=npm run build` | If Azure builds | Produces `dist/` |
| `RESEND_API_KEY` | Recommended | Consumables alerts |
| `RESEND_FROM_EMAIL` | Recommended | Verified sender domain |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 404 on `/tools/...` refresh | Confirm `server.js` SPA fallback is running (`npm start`), not static-only hosting |
| `/api/send-low-stock` 404 | Startup must be Node `server.js`, not only serving `dist` |
| App shows Azure default page | Deploy failed or wrong startup; check **Log stream** |
| Email not sending | Set `RESEND_API_KEY`; check Log stream for errors |
| Build fails on Azure | Node 20 runtime; run `npm ci && npm run build` locally to reproduce |
| Cold start / timeout on F1 | Move to B1 for production |

**Log stream:** Portal → Web App → **Log stream** or:

```bash
az webapp log tail --name imprintid-apps --resource-group rg-imprintid-apps
```

---

## Cutover from Vercel

1. Deploy and test on `*.azurewebsites.net`
2. Set App Settings (Resend, etc.)
3. Point DNS for `imprintidapps.com` to Azure
4. Keep GitHub as source of truth; disable Vercel production deploy when stable
5. External tool links (proof generator, art revision tracker) can stay on Vercel until those apps also move to Azure

---

## Quick command summary

```bash
# Local Azure-like run
npm ci && npm run build && npm start

# Create + configure (CLI)
az group create -n rg-imprintid-apps -l eastus
az appservice plan create -g rg-imprintid-apps -n plan-imprintid-apps --is-linux --sku B1
az webapp create -g rg-imprintid-apps -p plan-imprintid-apps -n imprintid-apps --runtime "NODE:20-lts"
az webapp config set -g rg-imprintid-apps -n imprintid-apps --startup-file "npm start"
az webapp config appsettings set -g rg-imprintid-apps -n imprintid-apps --settings \
  SCM_DO_BUILD_DURING_DEPLOYMENT=true \
  POST_BUILD_COMMAND="npm run build" \
  NODE_ENV=production \
  RESEND_API_KEY="re_xxx" \
  RESEND_FROM_EMAIL="imprintID Apps <noreply@yourdomain.com>"
```

Then connect GitHub Deployment Center or use the Actions workflow with the publish profile secret.
