import { useState } from "react";
import "./App.css";
import { COLORS } from "./constants/color";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import type { ToastState, ToastType } from "./types";
import { useAuth } from "./features/auth/useAuth";

// Layout & UI
import Sidebar from "./components/Layout/Sidebar";
import Toast from "./components/UI/Toast";
import Header from "./components/Layout/Header";
import RequireRole from "./components/Layout/RequireRole";

// Público y autenticación
import ConsultaCertificado from "./features/publico/ConsultaCertificado";
import LoginPage from "./features/auth/LoginPage";

// Académico (Administrador / Instructor)
import Calendario from "./features/academico/Calendario";
import ProgramarCurso from "./features/academico/ProgramarCurso";
import InscribirParticipante from "./features/academico/InscribirParticipante";
import Dashboard from "./features/academico/Dashboard";
import Evaluaciones from "./features/academico/Evaluaciones";
import EditarEvaluacion from "./features/academico/EditarEvaluacion";
import Resultados from "./features/academico/Resultados";

// Empresa
import RegistrarTrabajador from "./features/empresa/RegistrarTrabajador";
import DocumentosTrabajador from "./features/empresa/DocumentosTrabajador";
import InscribirTrabajador from "./features/empresa/InscribirTrabajador";
import MisCertificados from "./features/empresa/MisCertificados";

// Administrador
import UsuariosAdmin from "./features/admin/UsuariosAdmin";
import Facturacion from "./features/admin/Facturacion";
import Inventario from "./features/admin/Inventario";

function RedirectHome() {
  const { usuario } = useAuth();
  const destino = usuario?.rol_nombre === "Empresa" ? "/empresa/trabajadores" : "/dashboard";
  return <Navigate to={destino} replace />;
}

function AuthenticatedShell() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.lightGray, fontFamily: "Inter, Segoe UI, Arial, sans-serif" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        <Header />
        <div style={{ padding: "0 40px 40px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function App() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: ToastType) => setToast({ message, type });

  return (
    <>
      <Routes>
        <Route path="/" element={<ConsultaCertificado />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AuthenticatedShell />}>
          <Route
            path="/dashboard"
            element={
              <RequireRole roles={["Administrador", "Instructor"]}>
                <Dashboard />
              </RequireRole>
            }
          />
          <Route
            path="/calendario"
            element={
              <RequireRole roles={["Administrador", "Instructor", "Empresa"]}>
                <Calendario onToast={showToast} />
              </RequireRole>
            }
          />
          <Route
            path="/programar"
            element={
              <RequireRole roles={["Administrador", "Instructor"]}>
                <ProgramarCurso onToast={showToast} />
              </RequireRole>
            }
          />
          <Route
            path="/inscribir"
            element={
              <RequireRole roles={["Administrador", "Instructor"]}>
                <InscribirParticipante onToast={showToast} />
              </RequireRole>
            }
          />

          <Route
            path="/academico/evaluaciones"
            element={
              <RequireRole roles={["Administrador", "Instructor"]}>
                <Evaluaciones onToast={showToast} />
              </RequireRole>
            }
          />
          <Route
            path="/academico/evaluaciones/:idEvaluacion"
            element={
              <RequireRole roles={["Administrador", "Instructor"]}>
                <EditarEvaluacion onToast={showToast} />
              </RequireRole>
            }
          />
          <Route
            path="/academico/resultados"
            element={
              <RequireRole roles={["Administrador", "Instructor"]}>
                <Resultados onToast={showToast} />
              </RequireRole>
            }
          />

          <Route
            path="/empresa/trabajadores"
            element={
              <RequireRole roles={["Empresa"]}>
                <RegistrarTrabajador onToast={showToast} />
              </RequireRole>
            }
          />
          <Route
            path="/empresa/documentos"
            element={
              <RequireRole roles={["Empresa"]}>
                <DocumentosTrabajador onToast={showToast} />
              </RequireRole>
            }
          />
          <Route
            path="/empresa/inscribir"
            element={
              <RequireRole roles={["Empresa"]}>
                <InscribirTrabajador onToast={showToast} />
              </RequireRole>
            }
          />
          <Route
            path="/empresa/certificados"
            element={
              <RequireRole roles={["Empresa"]}>
                <MisCertificados onToast={showToast} />
              </RequireRole>
            }
          />

          <Route
            path="/admin/usuarios"
            element={
              <RequireRole roles={["Administrador"]}>
                <UsuariosAdmin onToast={showToast} />
              </RequireRole>
            }
          />
          <Route
            path="/admin/facturacion"
            element={
              <RequireRole roles={["Administrador"]}>
                <Facturacion onToast={showToast} />
              </RequireRole>
            }
          />
          <Route
            path="/admin/inventario"
            element={
              <RequireRole roles={["Administrador"]}>
                <Inventario onToast={showToast} />
              </RequireRole>
            }
          />

          <Route path="*" element={<RedirectHome />} />
        </Route>
      </Routes>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default App;
