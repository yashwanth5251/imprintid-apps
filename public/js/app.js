const ICONS = {
  default: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" stroke-width="1.8"/><path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  shipping: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 7h11v10H3V7Zm11 3h4.2L21 13.2V17h-7v-7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="18.5" r="1.7" fill="currentColor"/><circle cx="17" cy="18.5" r="1.7" fill="currentColor"/></svg>`,
  "sales-marketing": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19V9l7-5 7 5v10" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 19v-6h6v6" stroke="currentColor" stroke-width="1.8"/></svg>`,
  ordering: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 4h10l1.5 4H5.5L7 4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M6 8h12v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8Z" stroke="currentColor" stroke-width="1.8"/><path d="M9 12h6M9 15h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  operations: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" stroke="currentColor" stroke-width="1.8"/><path d="M19.4 13a7.7 7.7 0 0 0 .05-2l2-1.15-2-3.45-2.3.75a7.9 7.9 0 0 0-1.75-1L15 4h-6l-.4 2.15a7.9 7.9 0 0 0-1.75 1L4.55 6.4l-2 3.45L4.55 11a7.7 7.7 0 0 0 0 2l-2 1.15 2 3.45 2.3-.75a7.9 7.9 0 0 0 1.75 1L9 20h6l.4-2.15a7.9 7.9 0 0 0 1.75-1l2.3.75 2-3.45L19.4 13Z" stroke="currentColor" stroke-width="1.4" opacity=".9"/></svg>`,
};

const arrowIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const els = {
  categories: document.getElementById("categories"),
  categoryNav: document.getElementById("category-nav"),
  search: document.getElementById("tool-search"),
  count: document.getElementById("tools-count"),
  empty: document.getElementById("empty-state"),
  year: document.getElementById("year"),
  header: document.querySelector(".site-header"),
};

let catalog = { categories: [] };
let activeCategory = "all";

els.year.textContent = String(new Date().getFullYear());

window.addEventListener(
  "scroll",
  () => {
    els.header.classList.toggle("is-scrolled", window.scrollY > 8);
  },
  { passive: true }
);

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function matchesQuery(tool, category, query) {
  if (!query) return true;
  const haystack = [tool.name, tool.description, category.name, category.description]
    .map(normalize)
    .join(" ");
  return query.split(/\s+/).every((token) => haystack.includes(token));
}

function renderNav(categories) {
  const chips = [
    { id: "all", name: "All" },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ];

  els.categoryNav.innerHTML = chips
    .map(
      (chip) => `
      <button
        type="button"
        class="chip${activeCategory === chip.id ? " is-active" : ""}"
        data-category="${chip.id}"
        role="tab"
        aria-selected="${activeCategory === chip.id}"
      >
        ${chip.name}
      </button>`
    )
    .join("");
}

function renderCategories() {
  const query = normalize(els.search.value);

  const filtered = catalog.categories
    .filter((category) => activeCategory === "all" || category.id === activeCategory)
    .map((category) => ({
      ...category,
      tools: category.tools.filter((tool) => matchesQuery(tool, category, query)),
    }))
    .filter((category) => category.tools.length > 0);

  const toolCount = filtered.reduce((sum, c) => sum + c.tools.length, 0);
  els.count.textContent = `${toolCount} tool${toolCount === 1 ? "" : "s"}`;

  els.empty.hidden = filtered.length > 0;
  els.categories.hidden = filtered.length === 0;

  els.categories.innerHTML = filtered
    .map((category, index) => {
      const icon = ICONS[category.id] || ICONS.default;
      return `
      <section
        class="category"
        id="cat-${category.id}"
        data-accent="${category.accent || "blue"}"
        style="animation-delay: ${index * 60}ms"
      >
        <div class="category__head">
          <h3>${category.name}</h3>
          <p>${category.description || ""}</p>
        </div>
        <div class="tool-grid">
          ${category.tools
            .map((tool) => {
              const isSoon = tool.status === "coming-soon" || !tool.href || tool.href === "#";
              const badge = isSoon
                ? `<span class="tool-card__badge is-soon">Coming soon</span>`
                : `<span class="tool-card__badge">Open</span>`;
              const cta = isSoon
                ? `<span class="tool-card__cta">Link pending</span>`
                : `<span class="tool-card__cta">Open tool ${arrowIcon}</span>`;
              const attrs = isSoon
                ? `class="tool-card is-disabled" aria-disabled="true" tabindex="-1"`
                : `class="tool-card" href="${tool.href}" target="_blank" rel="noopener"`;
              const tag = isSoon ? "div" : "a";

              return `
                <${tag} ${attrs}>
                  <div class="tool-card__top">
                    <span class="tool-card__icon">${icon}</span>
                    ${badge}
                  </div>
                  <h4>${tool.name}</h4>
                  <p>${tool.description || ""}</p>
                  ${cta}
                </${tag}>`;
            })
            .join("")}
        </div>
      </section>`;
    })
    .join("");
}

function bindEvents() {
  els.categoryNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderNav(catalog.categories);
    renderCategories();
    if (activeCategory !== "all") {
      document.getElementById(`cat-${activeCategory}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });

  els.search.addEventListener("input", () => {
    renderCategories();
  });
}

async function init() {
  const response = await fetch("./data/tools.json", { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Failed to load tools.json (${response.status})`);
  }
  catalog = await response.json();
  renderNav(catalog.categories);
  renderCategories();
  bindEvents();
}

init().catch((error) => {
  console.error(error);
  els.categories.innerHTML = `<p class="empty-state">Could not load tools. Check <code>data/tools.json</code>.</p>`;
});
