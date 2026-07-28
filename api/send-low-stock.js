const ALERT_TO = "yash@imprintid.com";

function buildEmailHtml({ triggeredBy, departmentName, items }) {
  const rows = items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(it.department)}</td>
        <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(it.name)}</td>
        <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(it.supplier || "—")}</td>
        <td style="padding:8px;border:1px solid #ddd;">${it.currentQty} ${escapeHtml(it.unit || "")}</td>
        <td style="padding:8px;border:1px solid #ddd;">${it.thresholdQty} ${escapeHtml(it.unit || "")}</td>
        <td style="padding:8px;border:1px solid #ddd;">${it.reorderQty ?? "—"} ${escapeHtml(it.unit || "")}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#222;">
      <h2>Consumables low-stock alert</h2>
      <p><strong>Triggered by:</strong> ${escapeHtml(triggeredBy)}</p>
      <p><strong>Scope:</strong> ${escapeHtml(departmentName)}</p>
      <p>The following item(s) are at or below threshold and need reorder:</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Department</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Item</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Supplier</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Current</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Threshold</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Reorder</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:16px;color:#666;font-size:12px;">
        Sent automatically by imprintID Apps · Consumables Automation
      </p>
    </div>
  `;
}

function buildEmailText({ triggeredBy, departmentName, items }) {
  const lines = items.map(
    (it) =>
      `- [${it.department}] ${it.name} | supplier: ${it.supplier || "—"} | current: ${it.currentQty} ${it.unit} | threshold: ${it.thresholdQty} ${it.unit} | reorder: ${it.reorderQty ?? "—"} ${it.unit}`
  );
  return [
    "Consumables low-stock alert",
    `Triggered by: ${triggeredBy}`,
    `Scope: ${departmentName}`,
    "",
    ...lines,
  ].join("\n");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function sendWithResend({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;

  const from =
    process.env.RESEND_FROM_EMAIL || "imprintID Apps <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Resend error (${response.status})`);
  }
  return { provider: "resend", id: data.id };
}

async function sendWithFormSubmit({ to, subject, text, html }) {
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: subject,
      message: text,
      html,
      _template: "table",
      _captcha: "false",
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === "false") {
    throw new Error(data.message || `FormSubmit error (${response.status})`);
  }
  return { provider: "formsubmit", data };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      return res.status(400).json({ error: "No low-stock items provided." });
    }

    const to = body.to || ALERT_TO;
    const triggeredBy = body.triggeredBy || "Consumables Automation";
    const departmentName = body.departmentName || "Multiple departments";
    const subject = `[Consumables Alert] ${items.length} item(s) below threshold — ${departmentName}`;
    const html = buildEmailHtml({ triggeredBy, departmentName, items });
    const text = buildEmailText({ triggeredBy, departmentName, items });

    let result = await sendWithResend({ to, subject, html, text });
    if (!result) {
      result = await sendWithFormSubmit({ to, subject, html, text });
    }

    return res.status(200).json({
      ok: true,
      to,
      itemCount: items.length,
      ...result,
    });
  } catch (error) {
    console.error("send-low-stock error", error);
    return res.status(500).json({
      error: error.message || "Failed to send low-stock email.",
    });
  }
}
