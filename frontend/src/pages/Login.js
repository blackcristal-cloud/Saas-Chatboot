import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Bot, Building2, ChevronRight, ShieldCheck, RefreshCw, Moon, Sun, Languages } from "lucide-react";

export default function Login() {
  const { t, setCompany, theme, toggleTheme, toggleLang, lang } = useApp();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reseeding, setReseeding] = useState(false);

  const loadCompanies = () => {
    api
      .get("/companies")
      .then((res) => setCompanies(res.data))
      .catch(() => toast.error(t("common.error")));
  };

  useEffect(() => {
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnter = () => {
    if (!selected) return;
    setCompany({ id: selected.id, name: selected.name, niche: selected.niche, deploymentType: selected.deploymentType });
    navigate("/app/dashboard");
  };

  const handleReseed = async () => {
    setReseeding(true);
    try {
      await api.post("/seed");
      toast.success(t("login.reseedDone"));
      loadCompanies();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setReseeding(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left hero */}
      <div className={`relative hidden w-1/2 flex-col justify-between p-10 lg:flex ${theme === "dark" ? "hero-mesh-dark" : "hero-mesh-light"}`}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <p className="font-display text-lg font-semibold">SaaS Chatboot</p>
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">{t("login.heroTitle")}</h1>
          <p className="mt-4 text-base text-muted-foreground">{t("login.heroSubtitle")}</p>
        </div>
        <p className="text-xs text-muted-foreground">© 2025 SaaS Chatboot</p>
      </div>

      {/* Right form */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="absolute right-4 top-4 flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="login-theme-toggle" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleLang} data-testid="login-language-toggle" className="gap-1.5">
            <Languages className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase">{lang}</span>
          </Button>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="font-display text-2xl font-semibold">{t("login.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("login.subtitle")}</p>
          </div>

          <div className="space-y-2.5" data-testid="login-company-list">
            {companies === null ? (
              <>
                <Skeleton className="h-[72px] w-full rounded-xl" />
                <Skeleton className="h-[72px] w-full rounded-xl" />
                <Skeleton className="h-[72px] w-full rounded-xl" />
              </>
            ) : (
              companies.map((c) => (
                <Card
                  key={c.id}
                  onClick={() => setSelected(c)}
                  data-testid={`login-company-${c.id}`}
                  className={`cursor-pointer transition-colors ${
                    selected?.id === c.id ? "border-primary ring-1 ring-primary" : "hover:border-muted-foreground/40"
                  }`}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.niche}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${selected?.id === c.id ? "text-primary" : "text-muted-foreground/50"}`} />
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Button className="w-full" size="lg" disabled={!selected} onClick={handleEnter} data-testid="login-enter-button">
            {t("login.enter")}
          </Button>

          <div className="flex items-center justify-between">
            <Link
              to="/admin"
              data-testid="login-admin-link"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("login.adminAccess")}
            </Link>
            <button
              onClick={handleReseed}
              disabled={reseeding}
              data-testid="login-reseed-button"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <RefreshCw className={`h-3 w-3 ${reseeding ? "animate-spin" : ""}`} />
              {t("login.reseed")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
