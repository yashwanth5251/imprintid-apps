import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canAccessCategory } from "../data/users";
import {
  deleteArtwork,
  recordRepeatOrder,
  saveArtwork,
  searchArtworks,
} from "../data/artworkLibrary";
import "./Pages.css";
import "./ArtworkLibrary.css";

const EMPTY_FORM = {
  title: "",
  customer: "",
  sku: "",
  imprintMethod: "",
  imprintLocation: "",
  fileName: "",
  fileUrl: "",
  originalOrderId: "",
  notes: "",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function ArtworkLibraryPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [version, setVersion] = useState(0);
  const [repeatDrafts, setRepeatDrafts] = useState({});
  const canAccess = canAccessCategory(user.role, "artwork");

  const items = useMemo(() => {
    void version;
    return searchArtworks(query);
  }, [query, version]);

  const totals = useMemo(() => {
    void version;
    const all = searchArtworks("");
    return {
      count: all.length,
      repeats: all.reduce((sum, item) => sum + Math.max(0, (item.frequency || 1) - 1), 0),
    };
  }, [version]);

  if (!canAccess) {
    return <Navigate to="/" replace />;
  }
  function refresh(note = "") {
    setVersion((v) => v + 1);
    setMessage(note);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.customer.trim()) {
      setMessage("Title and customer are required.");
      return;
    }
    saveArtwork(form);
    setForm(EMPTY_FORM);
    refresh("Production artwork saved. Frequency starts at 1.");
  }

  function handleRepeat(id) {
    const orderId = repeatDrafts[id] || "";
    const updated = recordRepeatOrder(id, orderId);
    if (!updated) return;
    setRepeatDrafts((prev) => ({ ...prev, [id]: "" }));
    refresh(
      `Repeat order recorded for “${updated.title}”. Frequency is now ${updated.frequency}.`
    );
  }

  function handleDelete(id, title) {
    if (!window.confirm(`Remove “${title}” from the library?`)) return;
    deleteArtwork(id);
    refresh("Artwork removed from the library.");
  }

  return (
    <div className="page artwork-library">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Tools</Link>
        <span>/</span>
        <span>Artwork</span>
        <span>/</span>
        <span>Production Artwork Library</span>
      </nav>

      <header className="page-intro">
        <p className="eyebrow">Artwork tool</p>
        <h1>Production Artwork Library</h1>
        <p>
          Store production art for reuse on repeat orders. Each time you log a
          repeat, the frequency counter increases automatically.
        </p>
      </header>

      <div className="library-stats">
        <div>
          <strong>{totals.count}</strong>
          <span>Stored artworks</span>
        </div>
        <div>
          <strong>{totals.repeats}</strong>
          <span>Repeat uses logged</span>
        </div>
      </div>

      {message && <p className="library-toast">{message}</p>}

      <section className="library-panel">
        <h2>Add production artwork</h2>
        <form className="library-form" onSubmit={handleSubmit}>
          <label>
            Artwork title *
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Acme Logo — Left Chest"
              required
            />
          </label>
          <label>
            Customer *
            <input
              name="customer"
              value={form.customer}
              onChange={handleChange}
              placeholder="Customer / distributor name"
              required
            />
          </label>
          <label>
            SKU / style
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="MWBS1102"
            />
          </label>
          <label>
            Original order #
            <input
              name="originalOrderId"
              value={form.originalOrderId}
              onChange={handleChange}
              placeholder="SO-10482"
            />
          </label>
          <label>
            Imprint method
            <input
              name="imprintMethod"
              value={form.imprintMethod}
              onChange={handleChange}
              placeholder="Embroidery, Screen, DTG…"
            />
          </label>
          <label>
            Imprint location
            <input
              name="imprintLocation"
              value={form.imprintLocation}
              onChange={handleChange}
              placeholder="Left chest, full back…"
            />
          </label>
          <label>
            File name
            <input
              name="fileName"
              value={form.fileName}
              onChange={handleChange}
              placeholder="ACME_LC_3IN.dst"
            />
          </label>
          <label>
            File / drive link
            <input
              name="fileUrl"
              value={form.fileUrl}
              onChange={handleChange}
              placeholder="https://…"
            />
          </label>
          <label className="library-form__full">
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Size, PMS/thread colors, approval notes…"
            />
          </label>
          <button type="submit" className="btn-primary library-form__submit">
            Save artwork
          </button>
        </form>
      </section>

      <section className="library-panel">
        <div className="library-toolbar">
          <h2>Find for a repeat order</h2>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer, SKU, order #, file…"
            aria-label="Search production artwork"
          />
        </div>

        {items.length === 0 ? (
          <p className="empty-inline">No artworks match that search.</p>
        ) : (
          <div className="library-list">
            {items.map((item) => (
              <article key={item.id} className="library-card">
                <div className="library-card__head">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="library-card__meta">
                      {item.customer}
                      {item.sku ? ` · ${item.sku}` : ""}
                      {item.originalOrderId ? ` · Orig. ${item.originalOrderId}` : ""}
                    </p>
                  </div>
                  <div className="frequency-pill" title="Repeat order frequency">
                    <span className="frequency-pill__count">{item.frequency}</span>
                    <span className="frequency-pill__label">
                      {item.frequency === 1 ? "use" : "uses"}
                    </span>
                  </div>
                </div>

                <dl className="library-card__details">
                  <div>
                    <dt>Method</dt>
                    <dd>{item.imprintMethod || "—"}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{item.imprintLocation || "—"}</dd>
                  </div>
                  <div>
                    <dt>File</dt>
                    <dd>
                      {item.fileUrl ? (
                        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                          {item.fileName || "Open file"}
                        </a>
                      ) : (
                        item.fileName || "—"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Last used</dt>
                    <dd>{formatDate(item.lastUsedAt)}</dd>
                  </div>
                </dl>

                {item.notes && <p className="library-card__notes">{item.notes}</p>}

                <div className="library-card__actions">
                  <input
                    type="text"
                    value={repeatDrafts[item.id] || ""}
                    onChange={(e) =>
                      setRepeatDrafts((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    placeholder="Repeat order # (optional)"
                    aria-label={`Repeat order number for ${item.title}`}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleRepeat(item.id)}
                  >
                    Log repeat order
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => handleDelete(item.id, item.title)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
