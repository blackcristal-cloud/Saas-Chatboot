import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminShell } from "@/components/layout/AdminShell";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Treinamento from "@/pages/Treinamento";
import Canais from "@/pages/Canais";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminEmpresas from "@/pages/admin/AdminEmpresas";
import AdminEmpresaDetail from "@/pages/admin/AdminEmpresaDetail";
import AdminLicencas from "@/pages/admin/AdminLicencas";

const ClientGuard = ({ children }) => {
  const { company } = useApp();
  if (!company) return <Navigate to="/login" replace />;
  return children;
};

const AdminGuard = ({ children }) => {
  const token = localStorage.getItem("admin_token");
  if (!token) return <Navigate to="/admin" replace />;
  return children;
};

function AppRoutes() {
  const { company } = useApp();
  return (
    <Routes>
      <Route path="/" element={<Navigate to={company ? "/app/dashboard" : "/login"} replace />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/app"
        element={
          <ClientGuard>
            <AppShell />
          </ClientGuard>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="treinamento" element={<Treinamento />} />
        <Route path="canais" element={<Canais />} />
      </Route>

      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminShell />
          </AdminGuard>
        }
      >
        <Route path="empresas" element={<AdminEmpresas />} />
        <Route path="empresas/:id" element={<AdminEmpresaDetail />} />
        <Route path="licencas" element={<AdminLicencas />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
