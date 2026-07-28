import { ALERT_EMAIL, cloneCatalog } from "./consumablesCatalog";

const STORAGE_KEY = "imprintid-consumables-v1";
const ALERT_LOG_KEY = "imprintid-consumables-alert-log";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function loadConsumables() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = cloneCatalog();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return cloneCatalog();
  }
}

export function saveConsumables(departments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
}

export function resetConsumables() {
  const seeded = cloneCatalog();
  saveConsumables(seeded);
  return seeded;
}

export function isLowStock(item) {
  if (item.thresholdQty == null || item.currentQty == null) return false;
  return Number(item.currentQty) <= Number(item.thresholdQty);
}

export function getLowStockItems(departments) {
  const low = [];
  for (const dept of departments) {
    for (const item of dept.items) {
      if (isLowStock(item)) {
        low.push({
          departmentId: dept.id,
          departmentName: dept.name,
          ...item,
        });
      }
    }
  }
  return low;
}

export function updateItem(departments, departmentId, itemId, patch, userName) {
  const next = deepClone(departments);
  const dept = next.find((d) => d.id === departmentId);
  if (!dept) return { departments: next, item: null, crossedBelow: false };

  const item = dept.items.find((i) => i.id === itemId);
  if (!item) return { departments: next, item: null, crossedBelow: false };

  const wasLow = isLowStock(item);
  if (patch.currentQty !== undefined) {
    item.currentQty =
      patch.currentQty === "" || patch.currentQty == null
        ? null
        : Number(patch.currentQty);
  }
  if (patch.thresholdQty !== undefined) {
    item.thresholdQty =
      patch.thresholdQty === "" || patch.thresholdQty == null
        ? null
        : Number(patch.thresholdQty);
  }
  if (patch.reorderQty !== undefined) {
    item.reorderQty =
      patch.reorderQty === "" || patch.reorderQty == null
        ? null
        : Number(patch.reorderQty);
  }
  if (patch.notes !== undefined) item.notes = patch.notes;
  if (patch.supplier !== undefined) item.supplier = patch.supplier;

  item.lastUpdatedAt = new Date().toISOString();
  item.lastUpdatedBy = userName || "Unknown";

  const nowLow = isLowStock(item);
  const crossedBelow = nowLow && !wasLow;
  const stillLowAfterUpdate = nowLow;

  saveConsumables(next);
  return {
    departments: next,
    item,
    department: dept,
    crossedBelow,
    stillLowAfterUpdate,
  };
}

export function markAlerted(departments, alerts) {
  const next = deepClone(departments);
  const now = new Date().toISOString();
  for (const alert of alerts) {
    const dept = next.find((d) => d.id === alert.departmentId);
    const item = dept?.items.find((i) => i.id === alert.id);
    if (!item) continue;
    item.lastAlertedAt = now;
    item.lastAlertedQty = item.currentQty;
  }
  saveConsumables(next);
  return next;
}

export function shouldSendAlert(item) {
  if (!isLowStock(item)) return false;
  // Re-alert if never alerted, or quantity dropped further since last alert
  if (!item.lastAlertedAt) return true;
  if (
    item.lastAlertedQty == null ||
    Number(item.currentQty) < Number(item.lastAlertedQty)
  ) {
    return true;
  }
  return false;
}

export function appendAlertLog(entry) {
  try {
    const raw = localStorage.getItem(ALERT_LOG_KEY);
    const log = raw ? JSON.parse(raw) : [];
    log.unshift(entry);
    localStorage.setItem(ALERT_LOG_KEY, JSON.stringify(log.slice(0, 50)));
  } catch {
    /* ignore */
  }
}

export function readAlertLog() {
  try {
    const raw = localStorage.getItem(ALERT_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function sendLowStockEmail({ items, triggeredBy, departmentName }) {
  const payload = {
    to: ALERT_EMAIL,
    triggeredBy: triggeredBy || "Consumables Automation",
    departmentName: departmentName || "Multiple departments",
    items: items.map((it) => ({
      department: it.departmentName,
      name: it.name,
      supplier: it.supplier,
      currentQty: it.currentQty,
      thresholdQty: it.thresholdQty,
      reorderQty: it.reorderQty,
      unit: it.unit,
    })),
  };

  const response = await fetch("/api/send-low-stock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Email failed (${response.status})`);
  }
  return data;
}

export { ALERT_EMAIL };
