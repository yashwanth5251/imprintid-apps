import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleHasTools, roleHasReports } from "../data/users";
import logo from "../assets/logo.png";
import "./Header.css";

export default function Header() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const showTools = roleHasTools(user.role);
  const showReports = roleHasReports(user.role);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="app-header">
      <NavLink to="/" className="brand" end>
        <img src={logo} alt="imprintID" className="brand__logo" />
        <span className="brand__apps">Apps</span>
      </NavLink>

      <nav className="app-nav" aria-label="Primary">
        {showTools && (
          <NavLink to="/" end>
            Tools
          </NavLink>
        )}
        {showReports && <NavLink to="/reports">Power BI</NavLink>}
      </nav>

      <div className="app-header__user">
        <div className="user-chip">
          <span className="user-chip__name">{user.name}</span>
          <span className="user-chip__role">{role?.label}</span>
        </div>
        <button type="button" className="btn-ghost" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </header>
  );
}
