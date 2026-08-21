import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const MetricCard = ({ label, value, icon: Icon, hint, testId, accent = "primary" }) => {
  const accentClasses = {
    primary: "bg-primary/10 text-primary",
    info: "bg-sky-500/10 text-sky-500",
    success: "bg-emerald-500/10 text-emerald-500",
    warning: "bg-amber-500/10 text-amber-500",
  };
  return (
    <Card className="card-lift" data-testid={testId}>
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentClasses[accent]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
