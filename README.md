# imprintID Apps

React (Vite) hub for internal tools and Power BI reports, with **role-based logins**.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

Sign in with an issued imprintID Apps username and password. Accounts are managed in `src/data/users.js`.

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

- **Azure Web Apps:** see **[docs/AZURE_DEPLOYMENT.md](docs/AZURE_DEPLOYMENT.md)** — Linux Node 20, Express `server.js`, GitHub Actions workflow

## Consumables email alerts

Low-stock emails go to `yash@imprintid.com` via `/api/send-low-stock`.

Set on **Azure App Service → Application settings**:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Without Resend, the API falls back to FormSubmit (first send may require inbox confirmation).
