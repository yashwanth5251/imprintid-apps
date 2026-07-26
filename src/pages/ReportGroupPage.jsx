import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { findReportGroup } from "../data/reports";
import { canAccessReportGroup } from "../data/users";
import { ReportCard } from "../components/Cards";
import "./Pages.css";

export default function ReportGroupPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const group = findReportGroup(groupId);

  if (!group || !canAccessReportGroup(user.role, groupId)) {
    return <Navigate to="/reports" replace />;
  }

  return (
    <div className="page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/reports">Power BI</Link>
        <span>/</span>
        <span>{group.name}</span>
      </nav>

      <header className="page-intro">
        <p className="eyebrow">Power BI · {group.name}</p>
        <h1>{group.name}</h1>
        <p>{group.description}</p>
      </header>

      <div className="card-grid">
        {group.reports.map((report) => (
          <ReportCard key={report.id} groupId={group.id} report={report} />
        ))}
      </div>
    </div>
  );
}
