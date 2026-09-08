# imprintID Apps

React (Vite) hub for internal tools and Power BI reports, with **role-based logins**.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Demo accounts

| Role | Username | Password | Sees |
|------|----------|----------|------|
| Admin | `admin` | `admin123` | All tools + all Power BI |
| Shipper | `shipper` | `ship123` | Shipping tools only |
| Sales & Marketing | `sales` | `sales123` | Sales, ordering & ops tools + sales reports |
| Ordering | `ordering` | `order123` | Ordering tools |
| Operations | `ops` | `ops123` | Ops tools + ops reports |
| Inventory | `inventory` | `inv123` | Inventory reports |
| Procurement | `procurement` | `proc123` | Procurement tools + finance reports |
| Accounts & Finance | `finance` | `fin123` | Finance tools + finance Power BI |
| Artwork | `artwork` | `art123` | Artwork tools only |
| Analyst | `analyst` | `data123` | All Power BI reports |

Click a demo chip on the login screen to autofill.

## Customize

- **Users / roles:** `src/data/users.js`
- **Tools:** `src/data/tools.js`
- **Power BI reports:** `src/data/reports.js` — set `embedUrl` on each report to the Power BI publish URL

## Build / deploy

```bash
npm install
npm run build
npm start          # Azure-style: serves dist/ + /api on PORT (default 8080)
```

- **Azure Web Apps (recommended):** see **[docs/AZURE_DEPLOYMENT.md](docs/AZURE_DEPLOYMENT.md)** — Linux Node 20, Express `server.js`, GitHub Actions workflow
- **Vercel:** `vercel.json` still works for SPA + `/api`

## Consumables email alerts

Low-stock emails go to `yash@imprintid.com` via `/api/send-low-stock`.

Set on **Azure App Service → Application settings** (or Vercel env):

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Without Resend, the API falls back to FormSubmit (first send may require inbox confirmation).
