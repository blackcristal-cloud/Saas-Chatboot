import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const WeeklyConversationsChart = ({ data }) => {
  const { t } = useApp();
  const weekDays = t("dashboard.weekDays");
  const chartData = (data || []).map((value, i) => ({ day: weekDays[i] || `D${i + 1}`, value }));
  const hasData = chartData.some((d) => d.value > 0);

  return (
    <Card data-testid="dashboard-weekly-conversations-chart">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg">{t("dashboard.weeklyConversations")}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] pt-2">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.35} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                  fontSize: "13px",
                }}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#chartFill)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{t("dashboard.noData")}</div>
        )}
      </CardContent>
    </Card>
  );
};
