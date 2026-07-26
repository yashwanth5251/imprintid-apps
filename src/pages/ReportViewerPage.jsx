import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { findReport } from "../data/reports";
import { canAccessReportGroup } from "../data/users";
import "./Pages.css";

export default function ReportViewerPage() {
  const { groupId, reportId } = useParams();
  const { user } = useAuth();
  const found = findReport(groupId, reportId);

  if (!found || !canAccessReportGroup(user.role, groupId)) {
    return <Navigate to="/reports" replace />;
  }

  const { group, report } = found;
  const hasEmbed = Boolean(report.embedUrl);

  return (
    <div className="page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/reports">Power BI</Link>
        <span>/</span>
        <Link to={`/reports/${group.id}`}>{group.name}</Link>
        <span>/</span>
        <span>{report.name}</span>
      </nav>

      <header className="page-intro page-intro--compact">
        <p className="eyebrow">Power BI report</p>
        <h1>{report.name}</h1>
        <p>{report.description}</p>
      </header>

      <div className="report-frame">
        {hasEmbed ? (
          <iframe
            title={report.name}
            src={report.embedUrl}
            allowFullScreen
          />
        ) : (
          <div className="report-placeholder">
            <div className="report-placeholder__viz" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <h2>Embed ready</h2>
            <p>
              Drop the Power BI publish URL into{" "}
              <code>src/data/reports.js</code> for{" "}
              <strong>{report.name}</strong> to load the live dashboard here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
