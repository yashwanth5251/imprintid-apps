export const TOOL_CATEGORIES = [
  {
    id: "shipping",
    name: "Shipping Tools",
    description: "Labels, tracking, freight estimates, and carrier workflows.",
    accent: "blue",
    tools: [
      {
        id: "Barcode Scanner",
        name: "Barcode Scanner",
        description: "View and scan barcodes for Picking & Packing inventory.",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "Packing Advisor",
        name: "Packing Advisor",
        description: "Get packing recommendations for the items based on the item size and weight.",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "Pallet Freight-estimator",
        name: "Pallet Freight-estimator",
        description: "Estimate the Pallet Dimesnions and freight cost based on the dimensions and weight of the items.",
        href: "https://pallet-freight-estimator.vercel.app/",
        status: "It's Live!",
      },
    ],
  },
  {
    id: "sales-marketing",
    name: "Sales & Marketing",
    description: "Flyers, presentations, and customer-facing assets.",
    accent: "gold",
    tools: [
      {
        id: "create-flyer",
        name: "Create Flyer",
        description: "Build branded product flyers for distributors.",
        href: "https://www.imprintid.com/",
        status: "live",
      },
      {
        id: "sales-flyer",
        name: "Sales Flyer",
        description: "Ready-to-share sales flyer generator.",
        href: "https://www.imprintid.com/sales-flyer",
        status: "live",
      },
      {
        id: "create-presentation",
        name: "Create Presentation",
        description: "Assemble product decks for meetings and pitches.",
        href: "https://www.imprintid.com/",
        status: "live",
      },
      {
        id: "stock-designs",
        name: "Stock Designs",
        description: "Browse ready artwork for common imprint needs.",
        href: "https://www.imprintid.com/info/stockdesign",
        status: "live",
      },
    ],
  },
  {
    id: "ordering",
    name: "Ordering Tools",
    description: "POs, catalogs, and order support workflows.",
    accent: "charcoal",
    tools: [
      {
        id: "submit-po",
        name: "Submit a PO",
        description: "Send purchase orders through the distributor portal.",
        href: "https://www.imprintid.com/order/submitpo",
        status: "live",
      },
      {
        id: "order-catalog",
        name: "Order Catalog",
        description: "Request printed or digital catalogs.",
        href: "https://www.imprintid.com/ordercatalog",
        status: "live",
      },
      {
        id: "view-catalogs",
        name: "View Catalogs",
        description: "Open current branded and non-branded catalogs.",
        href: "https://www.imprintid.com/info/View_catalog",
        status: "live",
      },
      {
        id: "track-order",
        name: "Track Order",
        description: "Check production and fulfillment status.",
        href: "#",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "operations",
    name: "Operations",
    description: "Day-to-day ops helpers for the team.",
    accent: "blue",
    tools: [
      {
        id: "artwork-checklist",
        name: "Artwork Checklist",
        description: "Validate art specs before production.",
        href: "https://www.imprintid.com/info/artwork_information",
        status: "live",
      },
      {
        id: "ordering-guide",
        name: "Ordering Guide",
        description: "Quick reference for lead times and order rules.",
        href: "https://www.imprintid.com/info/ordering_information",
        status: "live",
      },
    ],
  },
  {
    id: "procurement",
    name: "Procurement",
    description: "Sourcing, consumables, and purchase-order workflows.",
    accent: "gold",
    tools: [
      {
        id: "consumables-automation",
        name: "Consumables Automation",
        description:
          "Automate reorder triggers and requests for packaging and shop consumables.",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "purchase-orders-tracker",
        name: "Purchase Orders Tracker",
        description:
          "Track open POs, vendor confirmations, ETAs, and receipt status in one place.",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "vendor-scorecard",
        name: "Vendor Scorecard",
        description:
          "Compare supplier lead times, fill rates, and quality issues over time.",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "rfq-helper",
        name: "RFQ Helper",
        description:
          "Build and compare requests for quote across preferred vendors.",
        href: "#",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "accounts-finance",
    name: "Accounts & Finance",
    description: "Invoicing, payments, and day-to-day finance helpers.",
    accent: "charcoal",
    tools: [
      {
        id: "invoice-tracker",
        name: "Invoice Tracker",
        description:
          "Monitor customer invoices, payment status, and overdue balances.",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "ap-payment-schedule",
        name: "AP Payment Schedule",
        description:
          "Plan vendor payment runs and prioritize due dates by cash position.",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "expense-approvals",
        name: "Expense Approvals",
        description:
          "Review and approve team expenses before posting to the ledger.",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "credit-memo-helper",
        name: "Credit Memo Helper",
        description:
          "Draft and track credit memos for returns, claims, and adjustments.",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "commission-calculator",
        name: "Commission Calculator",
        description:
          "Estimate sales commissions from booked orders and paid invoices.",
        href: "#",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "artwork",
    name: "Artwork",
    description: "Proofs, production-ready files, and art workflow helpers.",
    accent: "blue",
    tools: [
      {
        id: "artwork-proof-generator",
        name: "Artwork Proof Generator",
        description:
          "Create customer-facing proofs with imprint placement, colors, and notes.",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "production-artwork-generator",
        name: "Production Artwork Generator",
        description:
          "Build production-ready art packages with specs, separations, and file naming.",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "production-artwork-library",
        name: "Production Artwork Library",
        description:
          "Store production art for reuse, fetch it on repeat orders, and auto-count frequency.",
        href: "/tools/artwork-library",
        internal: true,
        status: "live",
      },
      {
        id: "imprint-method-checker",
        name: "Imprint Method Checker",
        description:
          "Validate art against print method limits (embroidery, screen, DTG, laser, etc.).",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "color-match-assistant",
        name: "Color Match Assistant",
        description:
          "Map customer brand colors to PMS / thread / imprint color libraries.",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "art-revision-tracker",
        name: "Art Revision Tracker",
        description:
          "Track proof versions, customer approvals, and change requests by order.",
        href: "#",
        status: "coming-soon",
      },
      {
        id: "stock-design-browser",
        name: "Stock Design Browser",
        description:
          "Browse ready stock designs for common imprint needs.",
        href: "https://www.imprintid.com/info/stockdesign",
        status: "live",
      },
    ],
  },
];
