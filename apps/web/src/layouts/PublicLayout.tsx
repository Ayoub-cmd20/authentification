import { Link, Outlet } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { GovHeader } from "../components/GovHeader";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Logo } from "../components/Logo";
import { useLanguage } from "../contexts/LanguageContext";

export const PublicLayout = () => {
  const { t } = useLanguage();

  return (
    <AppShell>
      <GovHeader />
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center">
            <Logo size="lg" />
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold sm:gap-3">
            <Link to="/verify" className="hidden text-slate-600 hover:text-civic sm:inline">
              {t("navigation.verify")}
            </Link>
            <Link to="/login" className="text-slate-600 hover:text-civic">
              {t("navigation.login")}
            </Link>
            <Link to="/register/student" className="rounded-md bg-civic px-3 py-2 text-white shadow-sm hover:bg-blue-700">
              Request Certification
            </Link>
            <LanguageSwitcher />
          </div>
        </nav>
      </header>
      <Outlet />
    </AppShell>
  );
};
