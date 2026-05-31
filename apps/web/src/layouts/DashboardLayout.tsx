import { BarChart3, Bell, Building2, ClipboardCheck, FileSearch, Home, LogOut, ShieldCheck, Users } from "lucide-react";
import type React from "react";
import { Link, Navigate, NavLink, Outlet } from "react-router-dom";
import { AppShell, Header, Sidebar } from "../components/AppShell";
import { GovHeader } from "../components/GovHeader";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Logo } from "../components/Logo";
import { Button, cn } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import type { Role } from "../types";

const navByRole: Record<Role, { to: string; labelKey: string; icon: React.ElementType }[]> = {
  STUDENT: [
    { to: "/student", labelKey: "student.dashboard", icon: Home },
    { to: "/student/profile", labelKey: "common.profile", icon: Users },
    { to: "/student/submission", labelKey: "student.submissions", icon: ClipboardCheck },
    { to: "/student/notifications", labelKey: "common.notifications", icon: Bell }
  ],
  UNIVERSITY_ADMIN: [
    { to: "/admin", labelKey: "admin.dashboard", icon: Home },
    { to: "/admin/submissions", labelKey: "admin.submissions", icon: FileSearch }
  ],
  INSTITUTION: [
    { to: "/institution", labelKey: "institution.dashboard", icon: Home },
    { to: "/institution/search", labelKey: "institution.search", icon: ShieldCheck },
    { to: "/institution/history", labelKey: "institution.history", icon: FileSearch }
  ],
  MINISTRY_ADMIN: [
    { to: "/ministry", labelKey: "ministry.dashboard", icon: BarChart3 },
    { to: "/ministry/audit-logs", labelKey: "superAdmin.auditLogs", icon: FileSearch }
  ],
  SUPER_ADMIN: [
    { to: "/super-admin", labelKey: "superAdmin.dashboard", icon: Home },
    { to: "/super-admin/users", labelKey: "superAdmin.users", icon: Users },
    { to: "/super-admin/institutions", labelKey: "superAdmin.institutions", icon: Building2 },
    { to: "/super-admin/document-requirements", labelKey: "superAdmin.documentRequirements", icon: ClipboardCheck },
    { to: "/super-admin/audit-logs", labelKey: "superAdmin.auditLogs", icon: FileSearch }
  ]
};

export const roleHome = (role: Role) =>
  role === "STUDENT"
    ? "/student"
    : role === "UNIVERSITY_ADMIN"
      ? "/admin"
      : role === "INSTITUTION"
        ? "/institution"
        : role === "MINISTRY_ADMIN"
          ? "/ministry"
          : "/super-admin";

export const DashboardLayout = ({ role }: { role: Role }) => {
  const { user, loading, logout } = useAuth();
  const { t } = useLanguage();

  if (loading) return <main className="p-8">{t("common.loading")}</main>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={roleHome(user.role)} replace />;

  const nav = navByRole[role];
  return (
    <AppShell>
      <GovHeader />
      <Sidebar>
        <Link to={roleHome(role)} className="flex items-center gap-3 rounded-md px-2 py-1">
          <Logo size="sm" inverted />
        </Link>
        <div className="mt-6 rounded-md border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold uppercase text-white/60">Workspace</p>
          <p className="mt-1 text-sm font-bold">{role.replace("_", " ")}</p>
        </div>
        <nav className="mt-6 grid gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split("/").length <= 2}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white",
                  isActive && "bg-white text-navy shadow-sm"
                )
              }
            >
              <item.icon size={18} />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </Sidebar>
      <div className="lg:pl-72">
        <Header>
          <div>
            <p className="text-xs font-semibold uppercase text-civic">{user.role.replace("_", " ")}</p>
            <h1 className="text-lg font-bold text-navy">{user.fullName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="secondary" onClick={logout}>
              <LogOut size={16} />
              {t("common.logout")}
            </Button>
          </div>
        </Header>
        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </AppShell>
  );
};
