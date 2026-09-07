import { sendLowStockAlert } from "../server/lowStockEmail.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const result = await sendLowStockAlert(body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("send-low-stock error", error);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Failed to send low-stock email.",
    });
  }
}
