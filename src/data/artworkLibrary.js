const STORAGE_KEY = "imprintid-production-artwork-library";

const DEMO_SEED = [
  {
    id: "art-demo-1",
    title: "Acme Corp Logo — Left Chest",
    customer: "Acme Corp",
    sku: "MWBS1102",
    imprintMethod: "Embroidery",
    imprintLocation: "Left Chest",
    fileName: "ACME_LC_3IN_PMS286.dst",
    fileUrl: "",
    originalOrderId: "SO-10482",
    notes: "3\" wide, PMS 286 thread. Customer approved v3.",
    frequency: 4,
    createdAt: "2025-11-12T15:00:00.000Z",
    lastUsedAt: "2026-06-02T18:20:00.000Z",
  },
  {
    id: "art-demo-2",
    title: "Summit Golf Outing — Cap Front",
    customer: "Summit Distributors",
    sku: "XGOLF-CAP01",
    imprintMethod: "Screen Print",
    imprintLocation: "Cap Front",
    fileName: "SUMMIT_GOLF_2026_FRONT.ai",
    fileUrl: "",
    originalOrderId: "SO-11890",
    notes: "1-color white. Keep registration tight on curved panels.",
    frequency: 2,
    createdAt: "2026-01-20T12:00:00.000Z",
    lastUsedAt: "2026-04-08T14:10:00.000Z",
  },
];

function readLibrary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SEED));
      return DEMO_SEED;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEMO_SEED;
  } catch {
    return DEMO_SEED;
  }
}

function writeLibrary(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listArtworks() {
  return readLibrary().sort((a, b) => {
    if (b.frequency !== a.frequency) return b.frequency - a.frequency;
    return String(b.lastUsedAt || "").localeCompare(String(a.lastUsedAt || ""));
  });
}

export function saveArtwork(input) {
  const items = readLibrary();
  const now = new Date().toISOString();
  const entry = {
    id: `art-${Date.now()}`,
    title: input.title.trim(),
    customer: input.customer.trim(),
    sku: input.sku.trim(),
    imprintMethod: input.imprintMethod.trim(),
    imprintLocation: input.imprintLocation.trim(),
    fileName: input.fileName.trim(),
    fileUrl: input.fileUrl.trim(),
    originalOrderId: input.originalOrderId.trim(),
    notes: input.notes.trim(),
    frequency: 1,
    createdAt: now,
    lastUsedAt: now,
  };
  const next = [entry, ...items];
  writeLibrary(next);
  return entry;
}

export function recordRepeatOrder(id, repeatOrderId = "") {
  const items = readLibrary();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = items[index];
  const updated = {
    ...current,
    frequency: Number(current.frequency || 0) + 1,
    lastUsedAt: new Date().toISOString(),
    lastRepeatOrderId: repeatOrderId.trim() || current.lastRepeatOrderId || "",
  };
  items[index] = updated;
  writeLibrary(items);
  return updated;
}

export function deleteArtwork(id) {
  const next = readLibrary().filter((item) => item.id !== id);
  writeLibrary(next);
  return next;
}

export function searchArtworks(query) {
  const q = String(query || "")
    .toLowerCase()
    .trim();
  const items = listArtworks();
  if (!q) return items;
  return items.filter((item) => {
    const hay = [
      item.title,
      item.customer,
      item.sku,
      item.imprintMethod,
      item.imprintLocation,
      item.fileName,
      item.originalOrderId,
      item.lastRepeatOrderId,
      item.notes,
    ]
      .join(" ")
      .toLowerCase();
    return q.split(/\s+/).every((token) => hay.includes(token));
  });
}
