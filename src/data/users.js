/** Role permissions — categories & report groups each role can access */
export const ROLES = {
  admin: {
    id: "admin",
    label: "Admin",
    description: "Full access to every tool and Power BI report.",
    categories: ["*"],
    reportGroups: ["*"],
  },
  shipper: {
    id: "shipper",
    label: "Shipper",
    description: "Shipping labels, tracking, and freight tools only.",
    categories: ["shipping"],
    reportGroups: [],
  },
  sales: {
    id: "sales",
    label: "Sales & Marketing",
    description:
      "Sales & marketing, ordering, and operations tools, plus sales Power BI reports.",
    categories: ["sales-marketing", "ordering", "operations"],
    reportGroups: ["sales"],
  },
  ordering: {
    id: "ordering",
    label: "Ordering",
    description: "PO, catalog, and order workflow tools.",
    categories: ["ordering"],
    reportGroups: [],
  },
  operations: {
    id: "operations",
    label: "Operations",
    description: "Ops helpers and operations Power BI reports.",
    categories: ["operations"],
    reportGroups: ["operations"],
  },
  inventory: {
    id: "inventory",
    label: "Inventory",
    description: "Inventory Power BI reports and stock visibility.",
    categories: [],
    reportGroups: ["inventory"],
  },
  procurement: {
    id: "procurement",
    label: "Procurement",
    description: "Procurement tools and related vendor spend reporting.",
    categories: ["procurement"],
    reportGroups: ["finance"],
  },
  finance: {
    id: "finance",
    label: "Accounts & Finance",
    description: "Finance tools plus Accounts & Finance Power BI reports.",
    categories: ["accounts-finance"],
    reportGroups: ["finance"],
  },
  artwork: {
    id: "artwork",
    label: "Artwork",
    description: "Artwork proofs, production files, and art workflow tools.",
    categories: ["artwork"],
    reportGroups: [],
  },
  analyst: {
    id: "analyst",
    label: "Analyst",
    description: "All Power BI report groups (read-only analytics).",
    categories: [],
    reportGroups: ["*"],
  },
};

/** Issued login accounts — replace with real auth (Entra) in production */
export const USERS = [
  {
    username: "admin",
    password: "admin123",
    name: "Amin",
    role: "admin",
  },
  {
    username: "shipper",
    password: "ship123",
    name: "Yash",
    role: "shipper",
  },
  {
    username: "sales",
    password: "sales123",
    name: "Sam",
    role: "sales",
  },
  {
    username: "ordering",
    password: "order123",
    name: "Mohammad",
    role: "ordering",
  },
  {
    username: "ops",
    password: "ops123",
    name: "Nur",
    role: "operations",
  },
  {
    username: "inventory",
    password: "inv123",
    name: "Yash",
    role: "inventory",
  },
  {
    username: "procurement",
    password: "proc123",
    name: "Rezwan Procurement",
    role: "procurement",
  },
  {
    username: "finance",
    password: "fin123",
    name: "Pranamya Finance",
    role: "finance",
  },
  {
    username: "artwork",
    password: "art123",
    name: "Sharif Artwork",
    role: "artwork",
  },
  {
    username: "analyst",
    password: "data123",
    name: "Yash Analyst",
    role: "analyst",
  },
];

export function canAccessCategory(roleId, categoryId) {
  const role = ROLES[roleId];
  if (!role) return false;
  return role.categories.includes("*") || role.categories.includes(categoryId);
}

export function canAccessReportGroup(roleId, groupId) {
  const role = ROLES[roleId];
  if (!role) return false;
  return role.reportGroups.includes("*") || role.reportGroups.includes(groupId);
}

export function roleHasTools(roleId) {
  const role = ROLES[roleId];
  return Boolean(role && (role.categories.includes("*") || role.categories.length > 0));
}

export function roleHasReports(roleId) {
  const role = ROLES[roleId];
  return Boolean(
    role && (role.reportGroups.includes("*") || role.reportGroups.length > 0)
  );
}
