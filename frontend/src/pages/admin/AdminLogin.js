import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const { t } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (localStorage.getItem("admin_token")) {
    return <Navigate to="/admin/empresas" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/admin/login", { email, password });
      localStorage.setItem("admin_token", res.data.token);
      navigate("/admin/empresas");
    } catch {
      toast.error(t("admin.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-scope flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="font-display">{t("admin.login")}</CardTitle>
          <CardDescription>{t("admin.loginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="admin-login-form">
            <div className="space-y-2">
              <Label htmlFor="admin-email">{t("admin.email")}</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@saas.com"
                required
                data-testid="admin-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">{t("admin.password")}</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                data-testid="admin-password-input"
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading} data-testid="admin-login-submit-button">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("admin.signIn")}
            </Button>
            <p className="text-center text-xs text-muted-foreground" data-testid="admin-demo-hint">
              {t("admin.demoHint")}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
