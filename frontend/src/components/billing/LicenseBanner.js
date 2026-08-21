import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, MessageCircle } from "lucide-react";

export const LicenseBanner = () => {
  const { t, company } = useApp();
  const [expired, setExpired] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!company?.id) return;
    let cancelled = false;
    api
      .get(`/license/status`, { params: { companyId: company.id } })
      .then((res) => {
        if (!cancelled) setExpired(res.data.status === "expired" || !res.data.valid);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [company?.id]);

  if (!expired || dismissed) return null;

  const handleSupport = () => {
    window.open(
      "https://wa.me/5511999999999?text=" + encodeURIComponent("Olá! Minha licença expirou e preciso de ajuda para renovar."),
      "_blank"
    );
  };

  return (
    <div
      data-testid="license-banner"
      className="sticky top-0 z-40 flex min-h-[52px] w-full flex-wrap items-center gap-3 border-b border-red-900/40 bg-destructive px-4 py-2 text-destructive-foreground sm:px-6"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <p className="flex-1 text-sm font-medium" data-testid="license-banner-message">
        {t("banner.expired")}
      </p>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleSupport}
        data-testid="license-banner-support-button"
        className="gap-1.5 bg-white/95 text-red-700 hover:bg-white"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {t("banner.support")}
      </Button>
      <button
        onClick={() => setDismissed(true)}
        data-testid="license-banner-dismiss-button"
        aria-label={t("banner.dismiss")}
        className="rounded p-1 transition-colors hover:bg-white/15"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
