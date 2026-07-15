import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../lib/api";

export interface User { id?: string; _id?: string; username: string; email: string; }

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const cached = localStorage.getItem("user");
    if (cached) { try { setUser(JSON.parse(cached)); } catch {} }
    if (!token) { setLoading(false); return; }
    api.get("/api/auth/me")
      .then((res) => {
        const u = res.data?.user;
        if (u) { setUser(u); localStorage.setItem("user", JSON.stringify(u)); }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token: string, u: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };
  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}
