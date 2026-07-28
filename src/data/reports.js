/** Power BI report catalog — swap embedUrl with real Power BI publish URLs */
export const REPORT_GROUPS = [
  {
    id: "sales",
    name: "Sales Reports",
    description: "Revenue, brand performance, and distributor sales dashboards.",
    accent: "gold",
    reports: [
      {
        id: "x-brands-sales",
        name: "X-Brands Sales",
        description: "Performance across X-Brands apparel and accessories.",
        embedUrl: "https://app.powerbi.com/groups/me/reports/ac3fd822-8e09-48fb-b40a-bee417499a44/1879a76583405e10b639?experience=power-bi",
        status: "ready",
      },
      {
        id: "mw-sales",
        name: "MW Sales",
        description: "Made-to-order and MW collection sales trends.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "xecutive-sales",
        name: "X'ecutive Sales",
        description: "Premium X'ecutive Brands revenue and order mix.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "xtreme-golf-sales",
        name: "X'treme Golf Sales",
        description: "Golf essentials, kits, and tournament gifting sales.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "rejuve-sales",
        name: "Rejuve Sales",
        description: "Personal care and Rejuve product line performance.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "distributor-sales",
        name: "Distributor Sales Overview",
        description: "Top distributors, regions, and channel contribution.",
        embedUrl: "",
        status: "ready",
      },
    ],
  },
  {
    id: "inventory",
    name: "Inventory Reports",
    description: "Stock levels, warehouse health, and replenishment signals.",
    accent: "blue",
    reports: [
      {
        id: "stock-levels",
        name: "Stock Levels",
        description: "On-hand quantity by SKU, colorway, and warehouse.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "warehouse-inventory",
        name: "Warehouse Inventory",
        description: "Facility-level inventory and location utilization.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "low-stock-alerts",
        name: "Low Stock Alerts",
        description: "Items approaching reorder points or out of stock.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "inbound-receipts",
        name: "Inbound Receipts",
        description: "Expected receipts and open purchase order arrivals.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "aging-inventory",
        name: "Aging Inventory",
        description: "Slow-moving and aged inventory by category.",
        embedUrl: "",
        status: "ready",
      },
    ],
  },
  {
    id: "operations",
    name: "Operations Reports",
    description: "Production throughput, lead times, and fulfillment KPIs.",
    accent: "charcoal",
    reports: [
      {
        id: "production-throughput",
        name: "Production Throughput",
        description: "Daily and weekly production volume by work center.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "lead-time-analysis",
        name: "Lead Time Analysis",
        description: "Average lead times by product family and imprint method.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "fulfillment-sla",
        name: "Fulfillment SLA",
        description: "On-time ship rate and SLA exceptions.",
        embedUrl: "",
        status: "ready",
      },
    ],
  },
  {
    id: "finance",
    name: "Accounts & Finance Reports",
    description:
      "AP/AR aging, cash position, P&L, and margin dashboards for finance.",
    accent: "gold",
    reports: [
      {
        id: "ap-aging",
        name: "AP Aging",
        description: "Accounts payable aging by vendor and due bucket.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "ar-aging",
        name: "AR Aging",
        description: "Accounts receivable aging by customer and past-due risk.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "cash-position",
        name: "Cash Position",
        description: "Bank balances, expected inflows, and near-term outflows.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "profit-and-loss",
        name: "Profit & Loss",
        description: "Monthly and YTD P&L with brand and channel breakouts.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "gross-margin",
        name: "Gross Margin Analysis",
        description: "Margin by product family, imprint method, and customer.",
        embedUrl: "",
        status: "ready",
      },
      {
        id: "vendor-spend",
        name: "Vendor Spend",
        description: "Procurement spend concentration and PO commitment trends.",
        embedUrl: "",
        status: "ready",
      },
    ],
  },
];

export function findReportGroup(groupId) {
  return REPORT_GROUPS.find((g) => g.id === groupId) || null;
}

export function findReport(groupId, reportId) {
  const group = findReportGroup(groupId);
  if (!group) return null;
  const report = group.reports.find((r) => r.id === reportId);
  return report ? { group, report } : null;
}
