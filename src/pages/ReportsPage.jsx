import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { REPORT_GROUPS } from "../data/reports";
import { canAccessReportGroup, roleHasReports } from "../data/users";
import { ReportGroupCard } from "../components/Cards";
import "./Pages.css";

export default function ReportsPage() {
  const { user, role } = useAuth();

  const groups = useMemo(
    () => REPORT_GROUPS.filter((g) => canAccessReportGroup(user.role, g.id)),
    [user.role]
  );

  if (!roleHasReports(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page">
      <header className="page-intro">
        <p className="eyebrow">Power BI</p>
        <h1>Reports</h1>
        <p>
          Analytics for <strong>{role.label}</strong> — pick a report family to
          open individual dashboards.
        </p>
      </header>

      {groups.length === 0 ? (
        <p className="empty-inline">No report groups available for your role.</p>
      ) : (
        <div className="card-grid">
          {groups.map((group) => (
            <ReportGroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
