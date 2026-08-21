import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Eye, Cloud, Server } from "lucide-react";

export const LicenseStatusBadge = ({ status, t, testId }) => {
  if (status === "active") {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-emerald-600/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        data-testid={testId}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {t("admin.statusActive")}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1.5" data-testid={testId}>
      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
      {t("admin.statusExpired")}
    </Badge>
  );
};

export default function AdminEmpresas() {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState(null);

  useEffect(() => {
    api
      .get("/companies")
      .then((res) => setCompanies(res.data))
      .catch(() => toast.error(t("common.error")));
  }, [t]);

  const locale = lang === "pt" ? "pt-BR" : "en-US";

  return (
    <div className="space-y-6" data-testid="admin-companies-page">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("admin.companies")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.companiesSubtitle")}</p>
      </div>

      {companies === null ? (
        <Skeleton className="h-[320px] rounded-xl" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table data-testid="admin-companies-table">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.company")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("admin.niche")}</TableHead>
                  <TableHead>{t("admin.plan")}</TableHead>
                  <TableHead>{t("admin.licenseStatus")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("admin.expiresOn")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("admin.activeChannels")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("admin.deployment")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((c) => (
                  <TableRow key={c.id} data-testid={`admin-company-row-${c.id}`}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{c.niche}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{c.license?.plan || "-"}</Badge>
                    </TableCell>
                    <TableCell>
                      <LicenseStatusBadge
                        status={c.license?.computedStatus || "expired"}
                        t={t}
                        testId={`admin-company-license-status-${c.id}`}
                      />
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {c.license?.expirationDate ? new Date(c.license.expirationDate).toLocaleDateString(locale) : "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="font-mono text-sm">{c.activeChannels}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="gap-1.5">
                        {c.deploymentType === "on_premise" ? <Server className="h-3 w-3" /> : <Cloud className="h-3 w-3" />}
                        {c.deploymentType === "on_premise" ? t("admin.onPremise") : t("admin.cloud")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/empresas/${c.id}`)}
                        data-testid={`admin-company-view-${c.id}`}
                        className="gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t("admin.viewDetails")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
