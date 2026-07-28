const ICONS = {
  shipping: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7h11v10H3V7Zm11 3h4.2L21 13.2V17h-7v-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18.5" r="1.7" fill="currentColor" />
      <circle cx="17" cy="18.5" r="1.7" fill="currentColor" />
    </svg>
  ),
  "sales-marketing": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19V9l7-5 7 5v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 19v-6h6v6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  ordering: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 4h10l1.5 4H5.5L7 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6 8h12v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 12h6M9 15h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  operations: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 13a7.7 7.7 0 0 0 .05-2l2-1.15-2-3.45-2.3.75a7.9 7.9 0 0 0-1.75-1L15 4h-6l-.4 2.15a7.9 7.9 0 0 0-1.75 1L4.55 6.4l-2 3.45L4.55 11a7.7 7.7 0 0 0 0 2l-2 1.15 2 3.45 2.3-.75a7.9 7.9 0 0 0 1.75 1L9 20h6l.4-2.15a7.9 7.9 0 0 0 1.75-1l2.3.75 2-3.45L19.4 13Z"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity=".9"
      />
    </svg>
  ),
  sales: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 19V5M4 19h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 15v-4M12 15V8M16 15v-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  inventory: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 12v8M4 8.5l8 3.5 8-3.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  procurement: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7h13v11H3V7Zm13 2h3.5L22 12v6h-6V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 11h5M7 14h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  "accounts-finance": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 19V5h11l5 5v9H4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M15 5v5h5M8 13h6M8 16h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  artwork: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 18.5 9.5 5h5L20 18.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 14h9M12 5v3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="8" cy="19.5" r="1.4" fill="currentColor" />
      <circle cx="16" cy="19.5" r="1.4" fill="currentColor" />
    </svg>
  ),
  finance: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v18M8 8.5c0-1.7 1.8-3 4-3s4 1.3 4 3-1.8 3-4 3-4 1.3-4 3 1.8 3 4 3 4-1.3 4-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  chart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 19h16M7 16V9M12 16V5M17 16v-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h12M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export default function Icon({ name }) {
  return ICONS[name] || ICONS.chart;
}
