import { useState } from "react";
import "./App.css";
import {API_BASE, COLORS } from "./constants/color.js"
import { Routes, Route, Navigate } from 'react-router-dom'

// Layout & UI
import Sidebar from "./components/Layout/Sidebar.jsx";
import Toast from "./components/UI/Toast.jsx";

// Features
import Calendario from "./features/academico/Calendario.jsx";
import ProgramarCurso from "./features/academico/ProgramarCurso.jsx";
import InscribirParticipante from "./features/academico/InscribirParticipante.jsx";

import Header from "./components/Layout/Header";
import Dashboard from "./features/academico/Dashboard.jsx";

function App() {
const [vista, setVista] = useState("calendario");
  const [toast, setToast] = useState(null);
 
  const showToast = (message, type) => setToast({ message, type });
 
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.lightGray, fontFamily: "Inter, Segoe UI, Arial, sans-serif" }}>
      <Sidebar active={vista} onChange={setVista} />
      <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        <Header />

        <div
          style={{
          padding: "0 40px 40px",
        }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/calendario" replace />} />
            <Route path="/calendario" element={<Calendario onToast={showToast} />} />
            <Route path="/programar" element={<ProgramarCurso onToast={showToast} />} />
            <Route path="/inscribir" element={<InscribirParticipante onToast={showToast} />} />
          </Routes>
          </div>
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;