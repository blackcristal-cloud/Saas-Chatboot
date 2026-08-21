import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, KeyRound, Moon, Sun, Languages, LogOut, ShieldCheck, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NavItem = ({ to, icon: Icon, label, testId, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    data-testid={testId}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary/10 text-primary border-l-2 border-primary"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border-l-2 border-transparent"
      }`
    }
  >
    <Icon className="h-4 w-4 shrink-0" />
    <span>{label}</span>
  </NavLink>
);

const SidebarContent = ({ onNavigate }) => {
  const { t, theme, toggleTheme, toggleLang, lang } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-tight">SaaS Chatboot</p>
            <Badge variant="secondary" className="mt-0.5 text-[10px]" data-testid="admin-badge">
              {t("admin.panel")}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        <NavItem to="/admin/empresas" icon={Building2} label={t("admin.companies")} testId="admin-nav-companies" onClick={onNavigate} />
        <NavItem to="/admin/licencas" icon={KeyRound} label={t("admin.licenses")} testId="admin-nav-licenses" onClick={onNavigate} />
      </nav>

      <div className="px-3 pb-4">
        <Separator className="mb-3" />
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="admin-theme-toggle" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleLang} data-testid="admin-language-toggle" aria-label="Toggle language" className="gap-1.5">
            <Languages className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">{lang}</span>
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="admin-logout-button" aria-label={t("common.logout")}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AdminShell = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="admin-scope min-h-screen bg-background">
      <div className="flex">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r bg-card lg:block">
          <SidebarContent />
        </aside>

        <div className="sticky top-0 z-20 flex h-14 w-full items-center border-b bg-card px-4 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="admin-mobile-menu-button" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <p className="ml-2 font-display text-sm font-semibold">Admin</p>
        </div>

        <main className="w-full lg:pl-[260px]">
          <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
