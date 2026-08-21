import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { LicenseStatusBadge } from "@/pages/admin/AdminEmpresas";
import { CHANNEL_META } from "@/components/channels/ChannelIcons";
import { toast } from "sonner";
import { ArrowLeft, Cloud, Server, HeartPulse, Tag, Activity, MessagesSquare, Users } from "lucide-react";

export default function AdminEmpresaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useApp();
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get(`/companies/${id}`)
      .then((res) => setData(res.data))
      .catch(() => toast.error(t("common.error")));
  }, [id, t]);

  const locale = lang === "pt" ? "pt-BR" : "en-US";

  if (data === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[220px] rounded-xl" />
          <Skeleton className="h-[220px] rounded-xl" />
        </div>
      </div>
    );
  }

  const isOnPremise = data.deploymentType === "on_premise";
  const heartbeatDate = data.syncLog?.lastHeartbeatAt ? new Date(data.syncLog.lastHeartbeatAt) : null;
  const hoursAgo = heartbeatDate ? Math.round((Date.now() - heartbeatDate.getTime()) / 3600000) : null;

  return (
    <div className="space-y-6" data-testid="admin-company-detail">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/empresas")} data-testid="admin-company-back-button" aria-label={t("common.back")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{data.name}</h1>
          <p className="text-sm text-muted-foreground">{data.niche}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5" data-testid="admin-company-deployment-badge">
            {isOnPremise ? <Server className="h-3 w-3" /> : <Cloud className="h-3 w-3" />}
            {isOnPremise ? t("admin.onPremise") : t("admin.cloud")}
          </Badge>
          <LicenseStatusBadge status={data.license?.computedStatus || "expired"} t={t} testId="admin-company-detail-license-status" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* License card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">{t("admin.licenseStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("admin.plan")}</span>
              <Badge variant="secondary" className="capitalize">{data.license?.plan || "-"}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("admin.startedOn")}</span>
              <span>{data.license?.startDate ? new Date(data.license.startDate).toLocaleDateString(locale) : "-"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("admin.expiresOn")}</span>
              <span data-testid="admin-company-license-expiration">
                {data.license?.expirationDate ? new Date(data.license.expirationDate).toLocaleDateString(locale) : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Channels card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">{t("admin.channels")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2" data-testid="admin-company-channels">
              {(data.channels || []).map((ch) => {
                const meta = CHANNEL_META[ch.channelType];
                if (!meta) return null;
                const Icon = meta.icon;
                const isActive = ch.status === "active";
                const isPending = ch.status === "pending_approval";
                return (
                  <Badge
                    key={ch.channelType}
                    variant="outline"
                    className={`gap-1.5 py-1.5 ${
                      isActive
                        ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                    data-testid={`admin-company-channel-${ch.channelType}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {meta.name}
                    <span className="text-[10px] opacity-80">
                      {isPending ? t("channels.comingSoon") : isActive ? t("channels.connected") : t("channels.disconnected")}
                    </span>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync logs for on-premise */}
      {isOnPremise && (
        <Card data-testid="admin-company-sync-logs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Server className="h-4 w-4" />
              {t("admin.syncLogs")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.syncLog ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <HeartPulse className="h-3.5 w-3.5" />
                    {t("admin.lastHeartbeat")}
                  </div>
                  <p className="mt-1.5 text-sm font-medium" data-testid="admin-sync-heartbeat">
                    {heartbeatDate ? `${heartbeatDate.toLocaleString(locale)} (${hoursAgo}${t("admin.hoursAgo")})` : "-"}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Tag className="h-3.5 w-3.5" />
                    {t("admin.version")}
                  </div>
                  <p className="mt-1.5 font-mono text-sm font-medium" data-testid="admin-sync-version">
                    {data.syncLog.installedVersion}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Activity className="h-3.5 w-3.5" />
                    {t("admin.serverStatus")}
                  </div>
                  <div className="mt-1.5">
                    <Badge
                      variant="outline"
                      className={
                        data.syncLog.status === "online"
                          ? "gap-1.5 border-emerald-600/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "gap-1.5 text-muted-foreground"
                      }
                      data-testid="admin-sync-status"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${data.syncLog.status === "online" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                      {data.syncLog.status === "online" ? t("admin.online") : t("admin.offline")}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">{t("admin.aggregatedMetrics")}</p>
                  <div className="mt-1.5 space-y-1 text-sm" data-testid="admin-sync-metrics">
                    <p className="flex items-center gap-1.5">
                      <MessagesSquare className="h-3 w-3 text-muted-foreground" />
                      {t("admin.conversations")}: <span className="font-mono">{data.syncLog.aggregatedMetrics?.conversasTotal ?? "-"}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {t("admin.leads")}: <span className="font-mono">{data.syncLog.aggregatedMetrics?.leadsTotal ?? "-"}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                      {t("admin.uptimePct")}: <span className="font-mono">{data.syncLog.aggregatedMetrics?.uptimePct ?? "-"}%</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("admin.noSyncData")}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
