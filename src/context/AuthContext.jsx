import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { USERS, ROLES } from "../data/users";

const STORAGE_KEY = "imprintid-apps-session";
const AuthContext = createContext(null);

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession());

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const value = useMemo(() => {
    const role = user ? ROLES[user.role] : null;

    function login(username, password) {
      const match = USERS.find(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          u.password === password
      );
      if (!match) {
        return { ok: false, error: "Invalid username or password." };
      }
      const session = {
        username: match.username,
        name: match.name,
        role: match.role,
      };
      setUser(session);
      return { ok: true, user: session };
    }

    function logout() {
      setUser(null);
    }

    return { user, role, login, logout, isAuthenticated: Boolean(user) };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
