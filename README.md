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
npm run build
```

- **Vercel:** connected repo uses `vercel.json` (Vite → `dist`)
- **AWS S3/CloudFront:** sync `dist/` after build (see `scripts/deploy.sh` — update sync source to `dist` if needed)

Auth is demo/localStorage for now. Swap `AuthContext` for Cognito / Entra ID before production.
