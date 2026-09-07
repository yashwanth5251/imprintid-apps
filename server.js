/**
 * Azure App Service / local production server.
 * Serves the Vite build from dist/ and hosts /api/send-low-stock.
 */
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { sendLowStockAlert } from "./server/lowStockEmail.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");
const port = Number(process.env.PORT) || 8080;

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "imprintid-apps",
    time: new Date().toISOString(),
  });
});

app.post("/api/send-low-stock", async (req, res) => {
  try {
    const result = await sendLowStockAlert(req.body || {});
    res.status(200).json(result);
  } catch (error) {
    console.error("send-low-stock error", error);
    res.status(error.statusCode || 500).json({
      error: error.message || "Failed to send low-stock email.",
    });
  }
});

app.use(
  express.static(distDir, {
    index: false,
    maxAge: "1y",
    setHeaders(res, filePath) {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

// SPA fallback for React Router (Express 5)
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(path.join(distDir, "index.html"), (err) => {
    if (err) next(err);
  });
});

app.listen(port, () => {
  console.log(`imprintID Apps listening on port ${port}`);
});
