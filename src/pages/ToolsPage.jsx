import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TOOL_CATEGORIES } from "../data/tools";
import { canAccessCategory, roleHasTools, roleHasReports } from "../data/users";
import { ToolCard } from "../components/Cards";
import banner from "../assets/Headerbanner.png";
import "./Pages.css";

export default function ToolsPage() {
  const { user, role } = useAuth();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const allowed = useMemo(
    () => TOOL_CATEGORIES.filter((c) => canAccessCategory(user.role, c.id)),
    [user.role]
  );

  if (!roleHasTools(user.role)) {
    if (roleHasReports(user.role)) {
      return <Navigate to="/reports" replace />;
    }
    return (
      <div className="empty-panel">
        <h1>No tools assigned</h1>
        <p>Your role does not include tool access. Contact an admin if this is unexpected.</p>
      </div>
    );
  }

  const q = query.toLowerCase().trim();

  const filtered = allowed
    .filter((c) => activeCategory === "all" || c.id === activeCategory)
    .map((category) => ({
      ...category,
      tools: category.tools.filter((tool) => {
        if (!q) return true;
        const hay = `${tool.name} ${tool.description} ${category.name}`.toLowerCase();
        return q.split(/\s+/).every((token) => hay.includes(token));
      }),
    }))
    .filter((c) => c.tools.length > 0);

  const toolCount = filtered.reduce((n, c) => n + c.tools.length, 0);

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <img src={banner} alt="" className="hero__banner" />
        </div>
        <div className="hero__content">
          <p className="hero__eyebrow">imprintID Apps</p>
          <h1>
            Welcome back, <span>{user.name.split(" ")[0]}</span>
          </h1>
          <p className="hero__lede">
            Signed in as <strong>{role.label}</strong> — showing the tools you
            can use.
          </p>
          <div className="hero__search">
            <label className="sr-only" htmlFor="tool-search">
              Search tools
            </label>
            <input
              id="tool-search"
              type="search"
              placeholder="Search tools…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Your tools</h2>
          <p>
            {toolCount} tool{toolCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="chip-row" role="tablist" aria-label="Filter categories">
          <button
            type="button"
            className={`chip${activeCategory === "all" ? " is-active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            All
          </button>
          {allowed.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip${activeCategory === c.id ? " is-active" : ""}`}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="empty-inline">No tools match that search.</p>
        ) : (
          filtered.map((category) => (
            <div
              key={category.id}
              className="category"
              data-accent={category.accent}
            >
              <div className="category__head">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
              <div className="card-grid">
                {category.tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    categoryId={category.id}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
