import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES, USERS, roleHasTools } from "../data/users";
import logo from "../assets/logo.png";
import banner from "../assets/Headerbanner.png";
import "./Login.css";

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    const fallback = roleHasTools(user.role) ? "/" : "/reports";
    const dest = location.state?.from?.pathname || fallback;
    return <Navigate to={dest} replace />;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = login(username, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const fallback = roleHasTools(result.user.role) ? "/" : "/reports";
    navigate(location.state?.from?.pathname || fallback, { replace: true });
  }

  function fillDemo(u) {
    setUsername(u.username);
    setPassword(u.password);
    setError("");
  }

  return (
    <div className="login-page">
      <div className="page-bg" aria-hidden="true" />
      <div className="login-hero" aria-hidden="true">
        <img src={banner} alt="" />
      </div>

      <div className="login-layout">
        <section className="login-brand">
          <div className="login-brand__mark">
            <img src={logo} alt="imprintID" />
            <span>Apps</span>
          </div>
          <h1>
            Tools &amp; reports,
            <br />
            <em>role-ready.</em>
          </h1>
          <p>
            Sign in to open the apps and Power BI dashboards assigned to your
            team.
          </p>
        </section>

        <section className="login-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Sign in</h2>
            <p className="login-form__sub">Use your imprintID Apps account.</p>

            <label>
              Username
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="demo-accounts">
            <p className="demo-accounts__title">Demo accounts</p>
            <div className="demo-grid">
              {USERS.map((u) => (
                <button
                  key={u.username}
                  type="button"
                  className="demo-chip"
                  onClick={() => fillDemo(u)}
                >
                  <strong>{ROLES[u.role].label}</strong>
                  <span>{u.username}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
