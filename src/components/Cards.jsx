import { Link } from "react-router-dom";
import Icon from "./Icon";
import "./Cards.css";

export function ToolCard({ tool, categoryId }) {
  const isSoon = tool.status === "coming-soon" || !tool.href || tool.href === "#";

  const body = (
    <>
      <div className="card__top">
        <span className="card__icon">
          <Icon name={categoryId} />
        </span>
        <span className={`card__badge${isSoon ? " is-soon" : ""}`}>
          {isSoon ? "Coming soon" : "Open"}
        </span>
      </div>
      <h3>{tool.name}</h3>
      <p>{tool.description}</p>
      <span className="card__cta">
        {isSoon ? (
          "Link pending"
        ) : (
          <>
            Open tool <Icon name="arrow" />
          </>
        )}
      </span>
    </>
  );

  if (isSoon) {
    return (
      <div className="card is-disabled" aria-disabled="true">
        {body}
      </div>
    );
  }

  return (
    <a className="card" href={tool.href} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  );
}

export function ReportGroupCard({ group }) {
  return (
    <Link
      className={`card card--group accent-${group.accent}`}
      to={`/reports/${group.id}`}
    >
      <div className="card__top">
        <span className="card__icon">
          <Icon name={group.id} />
        </span>
        <span className="card__badge">{group.reports.length} reports</span>
      </div>
      <h3>{group.name}</h3>
      <p>{group.description}</p>
      <span className="card__cta">
        Browse reports <Icon name="arrow" />
      </span>
    </Link>
  );
}

export function ReportCard({ groupId, report }) {
  return (
    <Link className="card" to={`/reports/${groupId}/${report.id}`}>
      <div className="card__top">
        <span className="card__icon">
          <Icon name="chart" />
        </span>
        <span className="card__badge">Power BI</span>
      </div>
      <h3>{report.name}</h3>
      <p>{report.description}</p>
      <span className="card__cta">
        Open report <Icon name="arrow" />
      </span>
    </Link>
  );
}
