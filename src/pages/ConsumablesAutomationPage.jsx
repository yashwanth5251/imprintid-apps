import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canAccessCategory } from "../data/users";
import {
  ALERT_EMAIL,
  appendAlertLog,
  getLowStockItems,
  isLowStock,
  loadConsumables,
  markAlerted,
  readAlertLog,
  resetConsumables,
  sendLowStockEmail,
  shouldSendAlert,
  updateItem,
} from "../data/consumablesStore";
import "./Pages.css";
import "./ConsumablesAutomation.css";

function formatQty(value, unit) {
  if (value == null || value === "") return "—";
  return `${value} ${unit || ""}`.trim();
}

function statusOf(item) {
  if (item.currentQty == null) return "uncounted";
  if (item.thresholdQty == null) return "no-threshold";
  if (isLowStock(item)) return "low";
  return "ok";
}

export default function ConsumablesAutomationPage() {
  const { user } = useAuth();
  const canAccess = canAccessCategory(user.role, "procurement");

  const [departments, setDepartments] = useState(() => loadConsumables());
  const [activeDeptId, setActiveDeptId] = useState(
    () => loadConsumables()[0]?.id || ""
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [drafts, setDrafts] = useState({});
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [alertLog, setAlertLog] = useState(() => readAlertLog());

  useEffect(() => {
    setAlertLog(readAlertLog());
  }, [departments]);

  const activeDept = useMemo(
    () => departments.find((d) => d.id === activeDeptId) || departments[0],
    [departments, activeDeptId]
  );

  const lowAll = useMemo(() => getLowStockItems(departments), [departments]);

  const visibleItems = useMemo(() => {
    if (!activeDept) return [];
    const q = query.toLowerCase().trim();
    return activeDept.items.filter((item) => {
      const status = statusOf(item);
      if (filter === "low" && status !== "low") return false;
      if (filter === "uncounted" && status !== "uncounted") return false;
      if (!q) return true;
      return `${item.name} ${item.supplier} ${item.notes}`
        .toLowerCase()
        .includes(q);
    });
  }, [activeDept, query, filter]);

  if (!canAccess) {
    return <Navigate to="/" replace />;
  }

  function draftKey(itemId) {
    return `${activeDept.id}:${itemId}`;
  }

  function getDraft(item) {
    const key = draftKey(item.id);
    return (
      drafts[key] || {
        currentQty: item.currentQty ?? "",
        thresholdQty: item.thresholdQty ?? "",
        reorderQty: item.reorderQty ?? "",
        notes: item.notes || "",
      }
    );
  }

  function setDraftField(item, field, value) {
    const key = draftKey(item.id);
    setDrafts((prev) => ({
      ...prev,
      [key]: {
        ...getDraft(item),
        [field]: value,
      },
    }));
  }

  async function maybeEmailLowStock(alerts, scopeName, sourceDepartments = departments) {
    const toSend = alerts.filter(shouldSendAlert);
    if (!toSend.length) return { skipped: true };

    const result = await sendLowStockEmail({
      items: toSend,
      triggeredBy: user.name || user.username,
      departmentName: scopeName,
    });

    const next = markAlerted(sourceDepartments, toSend);
    setDepartments(next);

    appendAlertLog({
      at: new Date().toISOString(),
      to: ALERT_EMAIL,
      count: toSend.length,
      provider: result.provider,
      departmentName: scopeName,
      items: toSend.map((i) => i.name),
    });
    setAlertLog(readAlertLog());
    return result;
  }

  async function handleSave(item) {
    setBusyId(item.id);
    setError("");
    setToast("");
    try {
      const draft = getDraft(item);
      const result = updateItem(
        departments,
        activeDept.id,
        item.id,
        {
          currentQty: draft.currentQty,
          thresholdQty: draft.thresholdQty,
          reorderQty: draft.reorderQty,
          notes: draft.notes,
        },
        user.name || user.username
      );
      setDepartments(result.departments);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[draftKey(item.id)];
        return next;
      });

      if (result.stillLowAfterUpdate) {
        const alertItem = {
          ...result.item,
          departmentId: result.department.id,
          departmentName: result.department.name,
        };
        try {
          const emailResult = await maybeEmailLowStock(
            [alertItem],
            result.department.name,
            result.departments
          );
          if (emailResult?.skipped) {
            setToast(
              `Saved. “${item.name}” is still low, but alert was already sent for this level.`
            );
          } else {
            setToast(
              `Saved. Low stock detected — email sent to ${ALERT_EMAIL}.`
            );
          }
        } catch (emailErr) {
          setToast(`Saved inventory, but email failed: ${emailErr.message}`);
        }
      } else {
        setToast(`Updated “${item.name}”.`);
      }
    } catch (err) {
      setError(err.message || "Could not save item.");
    } finally {
      setBusyId("");
    }
  }

  async function handleSendAllLowAlerts() {
    setError("");
    setToast("");
    const pending = lowAll.filter(shouldSendAlert);
    if (!pending.length) {
      setToast("No new low-stock items need an email alert.");
      return;
    }
    try {
      await maybeEmailLowStock(pending, "All departments");
      setToast(`Alert email sent to ${ALERT_EMAIL} for ${pending.length} item(s).`);
    } catch (err) {
      setError(err.message || "Failed to send alert email.");
    }
  }

  function handleReset() {
    if (
      !window.confirm(
        "Reset all consumables to the audit-list defaults? Current counts will be cleared."
      )
    ) {
      return;
    }
    const seeded = resetConsumables();
    setDepartments(seeded);
    setDrafts({});
    setToast("Catalog reset from Consumables Audit list.");
  }

  return (
    <div className="page consumables-page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Tools</Link>
        <span>/</span>
        <span>Procurement</span>
        <span>/</span>
        <span>Consumables Automation</span>
      </nav>

      <header className="page-intro">
        <p className="eyebrow">Procurement · Audit list</p>
        <h1>Consumables Automation</h1>
        <p>
          Department-specific consumables from the imprintID audit list. Update
          current inventory anytime — when an item hits or falls below threshold,
          an email is sent automatically to <strong>{ALERT_EMAIL}</strong>.
        </p>
      </header>

      {toast && <p className="consumables-toast">{toast}</p>}
      {error && <p className="consumables-error">{error}</p>}

      <div className="consumables-stats">
        <div>
          <strong>{departments.length}</strong>
          <span>Departments</span>
        </div>
        <div>
          <strong>
            {departments.reduce((n, d) => n + d.items.length, 0)}
          </strong>
          <span>Tracked items</span>
        </div>
        <div className={lowAll.length ? "is-alert" : ""}>
          <strong>{lowAll.length}</strong>
          <span>Below threshold</span>
        </div>
      </div>

      <div className="consumables-toolbar">
        <div className="dept-chips">
          {departments.map((dept) => {
            const lowCount = dept.items.filter(isLowStock).length;
            return (
              <button
                key={dept.id}
                type="button"
                className={`chip${activeDept?.id === dept.id ? " is-active" : ""}`}
                onClick={() => setActiveDeptId(dept.id)}
              >
                {dept.name}
                {lowCount > 0 ? ` (${lowCount})` : ""}
              </button>
            );
          })}
        </div>
        <div className="toolbar-actions">
          <button type="button" className="btn-primary" onClick={handleSendAllLowAlerts}>
            Email all low-stock alerts
          </button>
          <button type="button" className="btn-ghost" onClick={handleReset}>
            Reset catalog
          </button>
        </div>
      </div>

      {activeDept && (
        <section className="consumables-panel">
          <div className="panel-head">
            <div>
              <h2>{activeDept.name}</h2>
              <p>Auditor / owner: {activeDept.auditor}</p>
            </div>
            <div className="panel-filters">
              <input
                type="search"
                placeholder="Search item or supplier…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All items</option>
                <option value="low">Below threshold</option>
                <option value="uncounted">Not counted yet</option>
              </select>
            </div>
          </div>

          <div className="consumables-table-wrap">
            <table className="consumables-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Supplier</th>
                  <th>Current</th>
                  <th>Threshold</th>
                  <th>Reorder</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => {
                  const draft = getDraft(item);
                  const status = statusOf(item);
                  return (
                    <tr key={item.id} className={status === "low" ? "is-low" : ""}>
                      <td>
                        <strong>{item.name}</strong>
                        {item.notes ? <small>{item.notes}</small> : null}
                      </td>
                      <td>{item.supplier}</td>
                      <td>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={draft.currentQty}
                          onChange={(e) =>
                            setDraftField(item, "currentQty", e.target.value)
                          }
                          aria-label={`Current qty for ${item.name}`}
                        />
                        <span className="unit">{item.unit}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={draft.thresholdQty}
                          onChange={(e) =>
                            setDraftField(item, "thresholdQty", e.target.value)
                          }
                          aria-label={`Threshold for ${item.name}`}
                        />
                        <span className="unit">{item.unit}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={draft.reorderQty}
                          onChange={(e) =>
                            setDraftField(item, "reorderQty", e.target.value)
                          }
                          aria-label={`Reorder qty for ${item.name}`}
                        />
                        <span className="unit">{item.unit}</span>
                      </td>
                      <td>
                        <span className={`status-pill status-${status}`}>
                          {status === "low"
                            ? "Below threshold"
                            : status === "uncounted"
                              ? "Needs count"
                              : status === "no-threshold"
                                ? "Set threshold"
                                : "OK"}
                        </span>
                        {item.lastUpdatedAt && (
                          <small>
                            Updated {new Date(item.lastUpdatedAt).toLocaleString()}
                            {item.lastUpdatedBy ? ` · ${item.lastUpdatedBy}` : ""}
                          </small>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-primary"
                          disabled={busyId === item.id}
                          onClick={() => handleSave(item)}
                        >
                          {busyId === item.id ? "Saving…" : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visibleItems.length === 0 && (
              <p className="empty-inline">No items match this filter.</p>
            )}
          </div>
        </section>
      )}

      {lowAll.length > 0 && (
        <section className="consumables-panel">
          <h2>Low-stock queue</h2>
          <ul className="low-list">
            {lowAll.map((item) => (
              <li key={`${item.departmentId}-${item.id}`}>
                <strong>{item.departmentName}</strong> — {item.name}:{" "}
                {formatQty(item.currentQty, item.unit)} / threshold{" "}
                {formatQty(item.thresholdQty, item.unit)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="consumables-panel">
        <h2>Alert history</h2>
        {alertLog.length === 0 ? (
          <p className="panel-note">No emails sent yet from this browser.</p>
        ) : (
          <ul className="alert-log">
            {alertLog.slice(0, 8).map((entry, idx) => (
              <li key={`${entry.at}-${idx}`}>
                <strong>{new Date(entry.at).toLocaleString()}</strong> → {entry.to}{" "}
                ({entry.count} item{entry.count === 1 ? "" : "s"}
                {entry.provider ? ` via ${entry.provider}` : ""})
                <span>{entry.items?.join(", ")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
