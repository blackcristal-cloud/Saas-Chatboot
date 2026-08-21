import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { WeeklyConversationsChart } from "@/components/dashboard/WeeklyConversationsChart";
import { Skeleton } from "@/components/ui/skeleton";
import { MessagesSquare, Users, Activity, MessageCircle } from "lucide-react";

export default function Dashboard() {
  const { t, company } = useApp();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (!company?.id) return;
    api
      .get(`/dashboard/${company.id}`)
      .then((res) => setMetrics(res.data))
      .catch(() => setMetrics({}));
  }, [company?.id]);

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("dashboard.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      {metrics === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label={t("dashboard.totalConversations")}
            value={(metrics.conversasTotal ?? 0).toLocaleString()}
            icon={MessagesSquare}
            accent="primary"
            testId="dashboard-metric-total-conversations"
          />
          <MetricCard
            label={t("dashboard.leads")}
            value={(metrics.leadsTotal ?? 0).toLocaleString()}
            icon={Users}
            accent="info"
            hint={`${t("dashboard.conversionRate")}: ${metrics.taxaConversao ?? 0}%`}
            testId="dashboard-metric-leads"
          />
          <MetricCard
            label={t("dashboard.uptime")}
            value={`${metrics.uptimePct ?? 0}%`}
            icon={Activity}
            accent="success"
            testId="dashboard-metric-uptime"
          />
          <MetricCard
            label={t("dashboard.messagesToday")}
            value={(metrics.mensagensHoje ?? 0).toLocaleString()}
            icon={MessageCircle}
            accent="warning"
            testId="dashboard-metric-messages-today"
          />
        </div>
      )}

      {metrics === null ? (
        <Skeleton className="h-[360px] rounded-xl" />
      ) : (
        <WeeklyConversationsChart data={metrics.conversasSemana} />
      )}
    </div>
  );
}
