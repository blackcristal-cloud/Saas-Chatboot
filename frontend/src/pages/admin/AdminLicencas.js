import React, { useCallback, useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LicenseStatusBadge } from "@/pages/admin/AdminEmpresas";
import { toast } from "sonner";
import { KeyRound, Loader2, BadgeCheck } from "lucide-react";

export default function AdminLicencas() {
  const { t, lang } = useApp();
  const [licenses, setLicenses] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ companyId: "", plan: "", days: "" });
  const [issuing, setIssuing] = useState(false);
  const [renewingId, setRenewingId] = useState(null);

  const locale = lang === "pt" ? "pt-BR" : "en-US";

  const loadData = useCallback(() => {
    Promise.all([api.get("/licenses"), api.get("/companies")])
      .then(([licRes, compRes]) => {
        setLicenses(licRes.data);
        setCompanies(compRes.data);
      })
      .catch(() => toast.error(t("common.error")));
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!form.companyId || !form.plan) return;
    setIssuing(true);
    try {
      const payload = { companyId: form.companyId, plan: form.plan };
      if (form.days !== "") payload.days = parseInt(form.days, 10);
      await api.post("/licenses", payload);
      toast.success(t("admin.generated"));
      setForm({ companyId: "", plan: "", days: "" });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || t("common.error"));
    } finally {
      setIssuing(false);
    }
  };

  const handleRenew = async (license) => {
    setRenewingId(license.id);
    try {
      await api.post(`/licenses/${license.id}/renew`, {});
      toast.success(t("admin.renewed"));
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || t("common.error"));
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-licenses-page">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("admin.licenses")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.licensesSubtitle")}</p>
      </div>

      {/* Issue form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <KeyRound className="h-4 w-4" />
            {t("admin.issueLicense")}
          </CardTitle>
          <CardDescription>{t("admin.issueLicenseDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleIssue} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="admin-license-issue-form">
            <div className="space-y-2">
              <Label>{t("admin.company")}</Label>
              <Select value={form.companyId} onValueChange={(v) => setForm((f) => ({ ...f, companyId: v }))}>
                <SelectTrigger data-testid="admin-license-company-select">
                  <SelectValue placeholder={t("admin.selectCompany")} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id} data-testid={`admin-license-company-option-${c.id}`}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("admin.plan")}</Label>
              <Select value={form.plan} onValueChange={(v) => setForm((f) => ({ ...f, plan: v }))}>
                <SelectTrigger data-testid="admin-license-plan-select">
                  <SelectValue placeholder={t("admin.selectPlan")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter" data-testid="admin-license-plan-starter">Starter (30 {t("common.days")})</SelectItem>
                  <SelectItem value="pro" data-testid="admin-license-plan-pro">Pro (30 {t("common.days")})</SelectItem>
                  <SelectItem value="enterprise" data-testid="admin-license-plan-enterprise">Enterprise (365 {t("common.days")})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="license-days">{t("admin.daysLabel")}</Label>
              <Input
                id="license-days"
                type="number"
                min="1"
                value={form.days}
                onChange={(e) => setForm((f) => ({ ...f, days: e.target.value }))}
                placeholder={t("admin.daysPlaceholder")}
                data-testid="admin-license-days-input"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={issuing || !form.companyId || !form.plan}
                data-testid="admin-license-issue-submit-button"
                className="w-full gap-2"
              >
                {issuing ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                {t("admin.generate")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Licenses table */}
      {licenses === null ? (
        <Skeleton className="h-[320px] rounded-xl" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table data-testid="admin-licenses-table">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.company")}</TableHead>
                  <TableHead>{t("admin.plan")}</TableHead>
                  <TableHead>{t("admin.licenseStatus")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("admin.startedOn")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("admin.expiresOn")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.map((lic) => (
                  <TableRow key={lic.id} data-testid={`admin-license-row-${lic.companyId}`}>
                    <TableCell className="font-medium">{lic.companyName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{lic.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <LicenseStatusBadge status={lic.computedStatus} t={t} testId={`admin-license-status-${lic.companyId}`} />
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {new Date(lic.startDate).toLocaleDateString(locale)}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {new Date(lic.expirationDate).toLocaleDateString(locale)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={lic.computedStatus === "expired" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleRenew(lic)}
                        disabled={renewingId === lic.id}
                        data-testid={`admin-license-renew-button-${lic.companyId}`}
                        className="gap-1.5"
                      >
                        {renewingId === lic.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BadgeCheck className="h-3.5 w-3.5" />}
                        {t("admin.confirmPaymentRenew")}
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
