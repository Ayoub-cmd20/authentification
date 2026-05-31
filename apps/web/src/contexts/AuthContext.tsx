import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type React from "react";
import { api } from "../api/client";
import type { Role, User } from "../types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Role>;
  registerStudent: (data: Record<string, string>) => Promise<Role>;
  registerInstitution: (data: Record<string, string>) => Promise<Role>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("uap_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((response) => setUser(response.data.user))
      .catch(() => localStorage.removeItem("uap_token"))
      .finally(() => setLoading(false));
  }, []);

  const acceptAuth = (data: { token: string; user: User }) => {
    localStorage.setItem("uap_token", data.token);
    setUser(data.user);
    return data.user.role;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => acceptAuth((await api.post("/auth/login", { email, password })).data),
      registerStudent: async (data) => acceptAuth((await api.post("/auth/register/student", data)).data),
      registerInstitution: async (data) => acceptAuth((await api.post("/auth/register/institution", data)).data),
      logout: () => {
        api.post("/auth/logout").catch(() => undefined);
        localStorage.removeItem("uap_token");
        setUser(null);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
