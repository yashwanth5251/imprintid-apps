import Header from "./Header";
import "./Layout.css";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <div className="page-bg" aria-hidden="true" />
      <Header />
      <main className="app-main">{children}</main>
    </div>
  );
}
