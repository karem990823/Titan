import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { API_DASHBOARD } from "../../constants/color";
import type { ApiResponse, ResumenDashboard } from "../../types";

interface CardProps {
  titulo: string;
  valor: number | string;
  icono: string;
}

function Card({ titulo, valor, icono }: CardProps) {
  return (
    <div className="flex-1 min-w-[220px] bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow p-gap-lg flex flex-col gap-gap-sm">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">{titulo}</span>
        <div className="w-10 h-10 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">{icono}</span>
        </div>
      </div>
      <p className="font-headline-lg text-headline-lg text-on-surface m-0">{valor}</p>
    </div>
  );
}

function Dashboard() {
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);

  useEffect(() => {
    apiFetch<ApiResponse<ResumenDashboard>>(`${API_DASHBOARD}/resumen`)
      .then((res) => setResumen(res.data))
      .catch(() => setResumen(null));
  }, []);

  return (
    <div className="flex flex-col gap-gap-lg">
      <div className="relative overflow-hidden bg-on-secondary-fixed rounded-xl p-gap-lg text-surface-bright">
        <h1 className="font-display-hero text-headline-lg uppercase m-0 text-surface-bright">TITAN-ES</h1>
        <p className="font-body-md text-body-md text-secondary-fixed mt-gap-2xs mb-0">
          Centro de Entrenamiento en Trabajo Seguro en Alturas
        </p>
      </div>

      <div className="flex flex-wrap gap-gap-md">
        <Card titulo="Cursos Programados" valor={resumen?.cursos_programados ?? "—"} icono="calendar_month" />
        <Card titulo="Participantes" valor={resumen?.participantes ?? "—"} icono="groups" />
        <Card titulo="Cursos Hoy" valor={resumen?.cursos_hoy ?? "—"} icono="today" />
        <Card titulo="Inscripciones" valor={resumen?.inscripciones ?? "—"} icono="assignment_ind" />
      </div>
    </div>
  );
}

export default Dashboard;
