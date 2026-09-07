import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, apiFetchBlob, descargarBlob } from "../../api/client";
import {
  API_CERTIFICADOS,
  API_SOLICITUDES_CONTACTO,
  API_TIPOS_IDENTIFICACION,
} from "../../constants/color";
import type { ApiResponse, CertificadoPublico, TipoDocumento } from "../../types";
import logo from "../../assets/logo.webp";

const IMG_HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCzy-LeGfWrbQaEjQIIiXU5dW7Av-RZxjzawthR8p9HbMMZeC-Ak3ggQ6uwzKMzgAMK73WmDLjA1zZ9oS6CUjTcj4gt7wBUxwfaSC2DwiGOyAq2FkOeRDpwqRsl5o0JNRrmf1ZsfNpUpsfd8jagvaPlgMpjJvEa5maIkRUWlxOkmHCbTVMk9JVBXhXMuHbG6oacRy3gGfsy3Ea66ObUXGqCbik-YdXWwJuZjHl7_-20BWgU5Oc1e3Ax";

interface Curso {
  badge: string;
  badgeColor: string;
  horas: string;
  titulo: string;
  descripcion: string;
  puntos: string[];
  imagen: string;
}

const CURSOS: Curso[] = [
  {
    badge: "Nivel Operativo",
    badgeColor: "bg-primary-container text-on-primary",
    horas: "40 Horas Teórico-Prácticas",
    titulo: "Trabajo Seguro en Alturas Avanzado",
    descripcion:
      "Ascenso, posicionamiento, progresión en estructuras metálicas y líneas de vida con simuladores reales de caída controlada.",
    puntos: ["Factor de caída y cálculo de claro", "Auto-rescate y evacuación rápida"],
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDa1V06VKh_fWqN0BD6sOahEbhpH_3mFWiYY86DNzBgyiUASvTkHKV8Au7bG4PdQVqj1GfyHq9OKdk-4KykKno2I4h6i3Pgb9stE4tdU4hEdNsmP-4cBHCGHf_IV69y5Zdr4VyA8e_l5dnOeZGeqg1CJAgGvKZom32EYB7h1zdlJQSMi264uO46UaLRLegdYugo2KtLn_uI4PI47QL6dgYMPgCnjvr1e5sMVaMrWNf3SmI0CihEBTPJ",
  },
  {
    badge: "Obligatorio Anual",
    badgeColor: "bg-secondary text-on-secondary",
    horas: "8 Horas Intensivas",
    titulo: "Reentrenamiento Anual en Alturas",
    descripcion:
      "Actualización de protocolos técnicos, revisión de nueva legislación aplicable, inspección de EPP y validación de destrezas operativas.",
    puntos: ["Novedades Res. 4272/2021", "Taller de descarte de equipos textiles"],
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC4wf5e_1VkNAIcTsZtOwREZDpu1tMpxp3LdoNCp0g96X5_RprJLegeVfgztKENLGF9v81R617NNX0pU9mHLHFt4yyOPwK53_q-yLus4yJ9TxuVPOf5Llo1L9egCLsH_0bz3qqDfwaaJ4k4KnAwoTD-es-ZYGCneyz9CzQ0LPj63IDYZD4WEtpZODoih4Q6cDzZGeBY_yZwr1Fol4axmOP8F4_ZxuWDyaDuy4ygaw9unIUu8hxiXbk6",
  },
  {
    badge: "Gestión y Mando",
    badgeColor: "bg-tertiary-container text-on-tertiary",
    horas: "80 Horas Especializadas",
    titulo: "Coordinador de Trabajo en Alturas",
    descripcion:
      "Diseño del programa de protección contra caídas, emisión de permisos de trabajo seguro en alturas (PTSA) y auditoría en obra.",
    puntos: ["Auditoría de anclajes estructurales", "Matriz de riesgos y plan de rescate"],
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-RSdpXjT7SZjbbJiqfdmr4CIsYfOjQPfWwM16cNsA8JQhvYEBlbmY58wuFbiIavgjw8Mk0Pj_bHrnxR62WmnJwbdGtaTHJyl2453VSPEv_KpzGmTPEvfFRYuI7xElGThLaou6D3dQ59Zx2aaa1eK_aftlHVpneRtREwO8mZgTbPpbjdnV2LjkJoxo2wSmKEdTq_E0fcrkYcy3eU2VkM8kt_lhFwwm9qZM2lKor5cyViy7GQEeEgDU",
  },
  {
    badge: "Técnico Avanzado",
    badgeColor: "bg-primary-container text-on-primary",
    horas: "60 Horas Alto Rendimiento",
    titulo: "Rescate Vertical y Espacios Confinados",
    descripcion:
      "Manejo de polipastos, camillas de evacuación Sked, monitoreo de atmósferas peligrosas y sistemas de recuperación asistida.",
    puntos: ["Sistemas 3:1 y 4:1 mecánicos", "Simulación de rescate en silo y tanque"],
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqPf434q6TY14G-2uziuVsqPXAF0Ix5yEDzhlEexbu6jBDcCofgfv7saK_XG-8JbQAca2Q0EsH9A65dA9VvFpuFzVc550Q-Z_pZt9BSslSMFIY4xPjIqNa8jJuSq1T-RsLJW4TnQlVGuBmnvrpa-yprH4mPSke3QN-yF6WTbJuO_OK7vZVjFpExK3taZyiA8DRBdmHBAXqwRCxPXA4C_XWyvh48Z8QGfq8IB86yOwzlbhSQR9SVV0C",
  },
];

interface Equipo {
  norma: string;
  titulo: string;
  descripcion: string;
  imagen: string;
}

const EQUIPOS: Equipo[] = [
  {
    norma: "ANSI Z359.11",
    titulo: "Arnés Multipropósito 4 Argollas",
    descripcion: "Revestimiento repelente de suciedad con indicador visual de impacto activo.",
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZF74uAvU43LPg7-0MDCiPWXBxw9N6a6kTSA3J38rYM42T3BdCyxjFz1R3_3oRjJyabaTFaiahoxXtoauJ-WZ8Cb6bG7VRVNXWmyoiGezfgw8nX3LwUvsnPJRhfjA2ViBRUvmkph8VfQAwYYmsBaTi5xXcH-A8yK6DctXTg04Ikg_mE6mJd70m7oXWjAe8mNFs2IhZEYmosfE3kmge0WGeDPN70MGnpeDGeIGrM3rEPcgt_H1-qq1t",
  },
  {
    norma: "ANSI Z359.14 Clase 2",
    titulo: "Línea de Vida Retráctil 10m",
    descripcion: "Carcasa de composite de alta resistencia con cable de acero galvanizado de 5mm.",
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBtxMHImXmnjmX1eakGNVj7vVJZlYBtZXuSFMiGgDiWy-8urH8uYNylXeS3pVujQbs6qi58sj2-4kQCO94DSoBk_jlfKEW1CB-Dtu3w2YD1giP3HvBTKjpznCWnXkbVkTm5h92jd7m9yelUxVbowqZedEq85Jxuqurn3L6KlAabCSS6ihsyoPYAisFXakz5x-sELqZ7hhHEzEJMm0KJvHy1TiLhP_yLE31AmGbEKvORtmilpgjNw5N4",
  },
  {
    norma: "ANSI Z359.13",
    titulo: "Eslinga en 'Y' con Absorbedor",
    descripcion: "Ganchos de estructura de 2 1/4 pulg con resistencia de compuerta a 3,600 lbs.",
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDsmk2sV8jMzdMVUHHTV5rNCSKQrttAUIWm28rp8J3dTVAZYIjLD23A7bnUlObocfpLhMOVd8SEwby6inP6AkyhDWl4nosWBjqlvt6u1X3YC1ZSc7M3fAiuUPJySTfQ01kI1N8cHDjTk7yAJ1zEpxyatuuVBRvW1U-MbJ0m_j0ASaaJei40E6JuOwVT_dl13jOOD1R4_RozYBTwySwcsmp0yfmJVGdHottTAMhR9y5kqqhRaQcSO0GK",
  },
  {
    norma: "ANSI Z89.1 Clase E",
    titulo: "Casco Dieléctrico Tipo II",
    descripcion: "Barbuquejo de 4 puntos de anclaje con liberación de emergencia y aislamiento eléctrico.",
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7iamYGg6TbGGbAeKL3FOn_e6p_rybkGB6bIh63f1eYAz3hrM-hD7Gk3IDr7cmjbkea5KfHNrXKyo5j5HyHh5wKNqBigARb_uCvNjlQr80ZBAr3X-bTgmIEu6mScGs6r6Tzd-Jz63lKEFr85the7fNaef7y_AZjq3YtGNOZm6ITKx8EoNzBAP6-PzghMlx1u3dc3dSC6w3Y_7LwsJjDq-shMhfs0mYmq73S6JROBHAvLtWCuIgx2Cw",
  },
  {
    norma: "EN 362 / ANSI Z359.12",
    titulo: "Mosquetones Forjados 50kN",
    descripcion: "Cierre automático de triple acción fabricado en acero aleado de alta tenacidad.",
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBHUHBhIlGUP7uCMN_feU8mUYxAgIxQcDpmaZcjwW8OiuuBzXbTGzHP0wzKT_Fx6caMFGCwg0SOjDQilfPsv55WN144LeQsN_C2FWl_rR8zXHdQjrpoGkGXmCWbUX44rnSyb0bTzyihUiqGhOLw55Bu5zSmOd0fjzXNfg9GggxLFq11x2I6HKOXbq46CQwJ1KKQpNDVz5Doh5Tt-c8Cb0DuH1i9FPAgDpBt4zhSRyBTlYFaNVnC5IaR",
  },
];

interface FotoInstalacion {
  span: string;
  minH: string;
  gradiente: string;
  etiqueta: string;
  etiquetaColor: string;
  titulo: string;
  imagen: string;
}

const INSTALACIONES: FotoInstalacion[] = [
  {
    span: "md:col-span-2 lg:col-span-2",
    minH: "min-h-[260px]",
    gradiente: "from-on-background/90 via-on-background/20 to-transparent",
    etiqueta: "Torre Principal A-4",
    etiquetaColor: "text-primary-fixed-dim",
    titulo: "Simuladores de Estructuras y Fachadas",
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDPBlR5YmanK-lKXJX-pfW8zg5DzqZJGjzxzZNYmQupA747M1DhSaCl9l3XyyT9gAeLC00s7Oo600KO1kb5ADGmogaeTFjq30RsCLTJAzQHNULUWh2AvqFScpzNEZ4ZnG7E18wuPX3Ayvu875t-Ioud9v1_wEJUoc09CeUYwcEDd8zmNBk88Jx6pssLEL51A5TPsAV61gAqOiWdVf9yjsrVG3L39nV5TA8SZgioOzYs-UW7DwGa3APh",
  },
  {
    span: "",
    minH: "min-h-[220px]",
    gradiente: "from-on-background/90 via-transparent to-transparent",
    etiqueta: "Técnicas Verticales",
    etiquetaColor: "text-secondary-fixed",
    titulo: "Acceso por Cuerdas",
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAbZm6bkS-6ry8OaQy9zummBiQajtVlFHYIezsuzMXYcyB_UuCdajU8AwIbzXfTaRTBiXtCopzCRjdxfBTPyrltjwjJ-QkFKGsdnmCAo3SuHwyyzrmae0Qj4wsTAmeJQH0h3Wg3olEkXb8wdRYrSzZ1jggrsRNizhhcoMaezARyzhH65PhjWECiDg2pbT4QSTCBZI7NlPve-qTrZJ62Epnwx_4BqxA8pbMdOdEtt2saN9szgC9KL_i_",
  },
  {
    span: "",
    minH: "min-h-[220px]",
    gradiente: "from-on-background/90 via-transparent to-transparent",
    etiqueta: "Ambientes Críticos",
    etiquetaColor: "text-secondary-fixed",
    titulo: "Módulo de Espacios Confinados",
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBI2WI9UjfqQzCbVa2gNbKxw5l1qmJIVUSS_DofcaZ_dcc0O04nGsKksk3fCR0mnzaH2tiJsljVNTboavi1MlCCI19dnYi5ysehKDZump5vV3Rsq46pOQT-RDFtRxNRumh6-emdznpyQpCWRTD8xe5sTThxxyn2CN2Qcf6cWzTs1Mv3f4F_a67c-OdFs0FjvPgOfa_0FWDVNIBjK-cFBq661CrXTkIiyVxGTV07jZCOLwHwtz_KsKpe",
  },
  {
    span: "md:col-span-1 lg:col-span-2",
    minH: "min-h-[220px]",
    gradiente: "from-on-background/90 via-transparent to-transparent",
    etiqueta: "Laboratorio de Pruebas",
    etiquetaColor: "text-primary-fixed-dim",
    titulo: "Ensayos Dinámicos de Caída Libre",
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBnJuckgxv7vp7TBMONo3QMmP-wLbGn9wKDR5q9rZxPH-_8lyJsg725DnlnD-OXN28mTMSAL83hlKXEgWIFeYSSaklOFbiGP_5afSSJKY8i3XwJHv68v1ShS7QrtxyE7UrOLkVaUJWBdCxnk-wZS9StG9Zhwuo4ZoyV1m3UoYfRlm9XbP0T0PyWLY62WiEo_NIhTj9_im2HNf5Ol_Ypoeo_xOipNHPQAg1fhYk9PoFviEQoXF3wrcur",
  },
  {
    span: "md:col-span-2 lg:col-span-2",
    minH: "min-h-[220px]",
    gradiente: "from-on-background/90 via-transparent to-transparent",
    etiqueta: "Graduaciones HSE",
    etiquetaColor: "text-secondary-fixed",
    titulo: "Certificación de Cuadrillas Corporativas",
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDalkQ0667KRpFxc68JO8vF3U7Iqauncni8EuUPrjtwL68y6aZIFhT_2Y5ZKTFfzQMWahLBruD4v1l4Mv5AQ9ryLBx9BhcrOedQhIUt8J0wlgRQm9iILLPVqgnTaabxd8tIXd44cE4JO2I1MpY5A0cgi1U7-rCwVGUAl-9FjlrR8IFHjDFZUyBXUsIq_2KMjth1CyhQiMJ9_gVqvGpRt0Dc4m22ZnNgTdMLBugmISabD6plGQ7DZTYL",
  },
];

const TIPOS_SERVICIO = [
  "Capacitación en Alturas (Grupo Empresarial)",
  "Reentrenamiento Anual de Cuadrillas",
  "Curso Coordinador Res. 4272",
  "Rescate Industrial y Espacios Confinados",
  "Inspección / Suministro de Equipos Certificados",
  "Instalación de Líneas de Vida Fijas",
];

function Icon({ children, className = "" }: { children: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function LandingPage() {
  // --- Validador de certificados (real, contra la API pública) ---
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [idTipo, setIdTipo] = useState("");
  const [numero, setNumero] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<CertificadoPublico[] | null>(null);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<TipoDocumento[]>(`${API_TIPOS_IDENTIFICACION}/`).then(setTiposDoc).catch(() => setTiposDoc([]));
  }, []);

  const buscarCertificado = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBusqueda(null);
    setResultados(null);
    setBuscando(true);
    try {
      const res = await apiFetch<ApiResponse<CertificadoPublico[]>>(
        `${API_CERTIFICADOS}/publico/buscar?id_tipo=${idTipo}&numero_identificacion=${numero}`
      );
      setResultados(res.data);
    } catch (err) {
      setErrorBusqueda(err instanceof Error ? err.message : "No se pudo realizar la consulta.");
    } finally {
      setBuscando(false);
    }
  };

  const descargarCertificado = async (idCertificado: number) => {
    setDescargandoId(idCertificado);
    try {
      const blob = await apiFetchBlob(
        `${API_CERTIFICADOS}/publico/${idCertificado}/descargar?id_tipo=${idTipo}&numero_identificacion=${numero}`
      );
      descargarBlob(blob, `certificado-${idCertificado}.pdf`);
    } catch {
      setErrorBusqueda("No se pudo descargar el certificado. Intenta nuevamente.");
    } finally {
      setDescargandoId(null);
    }
  };

  const busquedaValida = idTipo !== "" && numero.trim() !== "";

  // --- Formulario de cotización (real, contra la API) ---
  const [nombreContacto, setNombreContacto] = useState("");
  const [empresaContacto, setEmpresaContacto] = useState("");
  const [correoContacto, setCorreoContacto] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [tipoServicio, setTipoServicio] = useState(TIPOS_SERVICIO[0]);
  const [numeroPersonal, setNumeroPersonal] = useState("");
  const [detalleContacto, setDetalleContacto] = useState("");
  const [enviandoContacto, setEnviandoContacto] = useState(false);
  const [contactoEnviado, setContactoEnviado] = useState(false);
  const [errorContacto, setErrorContacto] = useState<string | null>(null);

  const contactoValido =
    nombreContacto.trim() !== "" &&
    empresaContacto.trim() !== "" &&
    /^\S+@\S+\.\S+$/.test(correoContacto) &&
    telefonoContacto.trim() !== "";

  const enviarContacto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactoValido) return;
    setEnviandoContacto(true);
    setErrorContacto(null);
    try {
      await apiFetch(`${API_SOLICITUDES_CONTACTO}/`, {
        method: "POST",
        body: JSON.stringify({
          nombre_contacto: nombreContacto,
          empresa: empresaContacto,
          correo: correoContacto,
          telefono: telefonoContacto,
          tipo_servicio: tipoServicio,
          numero_personal: numeroPersonal ? parseInt(numeroPersonal) : null,
          detalle: detalleContacto || null,
        }),
      });
      setContactoEnviado(true);
      setNombreContacto("");
      setEmpresaContacto("");
      setCorreoContacto("");
      setTelefonoContacto("");
      setTipoServicio(TIPOS_SERVICIO[0]);
      setNumeroPersonal("");
      setDetalleContacto("");
    } catch (err) {
      setErrorContacto(err instanceof Error ? err.message : "No se pudo enviar la solicitud.");
    } finally {
      setEnviandoContacto(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased">
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_4px_6px_-1px_rgba(14,42,71,0.08),0_10px_15px_-3px_rgba(14,42,71,0.12)]">
        <div className="h-20 w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop flex items-center justify-between relative">
          <a href="#" className="flex items-center gap-gap-sm hover:opacity-90 transition-opacity">
            <img alt="TITAN-ES Seguridad en Alturas" className="h-12 w-auto object-contain" src={logo} />
          </a>
          <nav className="hidden lg:flex items-center gap-gap-md font-headline-sm text-label-lg uppercase tracking-wider text-secondary">
            <a href="#" className="hover:text-primary transition-colors py-1">Inicio</a>
            <a href="#equipos" className="hover:text-primary transition-colors py-1">Equipos Homologados</a>
            <a href="#contacto" className="hover:text-primary transition-colors py-1">Cotizaciones</a>
          </nav>
          <div className="flex items-center gap-gap-xs sm:gap-gap-sm">
            <Link
              to="/login"
              className="px-gap-sm py-2 rounded-lg font-label-lg text-label-lg uppercase tracking-wider text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              Iniciar Sesión
            </Link>
            <a
              href="#contacto"
              className="px-gap-sm py-2 rounded-lg font-label-lg text-label-lg uppercase tracking-wider bg-secondary text-on-secondary hover:bg-on-secondary-fixed hover:text-on-secondary transition-colors"
            >
              Registrarse
            </a>
          </div>
        </div>
      </header>

      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          {/* HERO */}
          <section className="relative w-full overflow-hidden bg-on-secondary-fixed text-surface-bright py-gap-3xl px-margin-mobile md:px-margin-tablet lg:px-margin-desktop">
            <div className="absolute inset-0 opacity-25 pointer-events-none mix-blend-luminosity">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${IMG_HERO}')` }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-on-secondary-fixed via-on-secondary-fixed/90 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-max-container mx-auto flex flex-col gap-gap-xl pt-gap-md">
              <div className="inline-flex items-center gap-gap-xs bg-surface-container-highest/20 backdrop-blur-md px-gap-sm py-1.5 rounded-lg w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-surface-bright">
                  Normativa Internacional Res. 4272 • OSHA • ANSI Z359
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gap-xl items-center">
                <div className="lg:col-span-8 flex flex-col gap-gap-md">
                  <h1 className="font-display-hero text-display-hero uppercase tracking-tight text-surface-bright">
                    Líderes en Capacitación y Soluciones de{" "}
                    <span className="text-primary-fixed-dim">Trabajo Seguro en Alturas</span>
                  </h1>
                  <p className="font-body-lg text-body-lg text-secondary-fixed max-w-2xl leading-relaxed">
                    Formación técnica certificada conforme a normativas vigentes, inspección de sistemas
                    anticaídas y suministro de equipos homologados para la máxima protección industrial sin
                    margen de error.
                  </p>
                  <div className="flex flex-wrap items-center gap-gap-sm pt-gap-xs">
                    <a
                      className="inline-flex items-center justify-center gap-gap-xs px-gap-lg py-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider transition-all duration-150 shadow-md"
                      href="#cursos"
                    >
                      <Icon>school</Icon>
                      <span>Ver Cursos Disponibles</span>
                    </a>
                    <a
                      className="inline-flex items-center justify-center gap-gap-xs px-gap-lg py-3 rounded-lg bg-surface-container-highest/30 hover:bg-surface-container-highest/50 text-surface-bright font-headline-sm text-headline-sm uppercase tracking-wider backdrop-blur-md transition-all duration-150 shadow-sm"
                      href="#validador"
                    >
                      <Icon>workspace_premium</Icon>
                      <span>Consultar y Descargar Certificado</span>
                    </a>
                  </div>
                </div>
                <div className="lg:col-span-4 flex flex-col gap-gap-sm bg-surface-container-lowest/10 backdrop-blur-md p-gap-lg rounded-xl shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-surface-dim">
                      Estadísticas Operativas
                    </span>
                    <Icon className="text-secondary-fixed text-lg">monitoring</Icon>
                  </div>
                  <div className="grid grid-cols-2 gap-gap-sm pt-gap-xs">
                    <div className="flex flex-col bg-on-background/40 p-gap-sm rounded-lg">
                      <span className="font-headline-lg text-headline-lg text-primary-fixed-dim font-bold">+15,000</span>
                      <span className="font-label-md text-label-md text-surface-dim">Técnicos Certificados</span>
                    </div>
                    <div className="flex flex-col bg-on-background/40 p-gap-sm rounded-lg">
                      <span className="font-headline-lg text-headline-lg text-surface-bright font-bold">99.8%</span>
                      <span className="font-label-md text-label-md text-surface-dim">Tasa de Aprobación Técnica</span>
                    </div>
                    <div className="flex flex-col bg-on-background/40 p-gap-sm rounded-lg">
                      <span className="font-headline-md text-headline-md text-surface-bright font-bold">100%</span>
                      <span className="font-label-md text-label-md text-surface-dim">Torre Real Homologada</span>
                    </div>
                    <div className="flex flex-col bg-on-background/40 p-gap-sm rounded-lg">
                      <span className="font-headline-md text-headline-md text-secondary-fixed font-bold">QR Activo</span>
                      <span className="font-label-md text-label-md text-surface-dim">Validación Instantánea</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-gap-xs text-secondary-fixed font-label-sm text-label-sm uppercase tracking-wider pt-gap-2xs">
                    <Icon className="text-base">verified</Icon>
                    <span>Centro Técnico de Alturas Acreditado</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* VALIDADOR DE CERTIFICADOS (real) */}
          <section className="relative -mt-8 z-20 px-margin-mobile md:px-margin-tablet lg:px-margin-desktop" id="validador">
            <div className="max-w-max-container mx-auto">
              <div className="bg-surface-container-lowest rounded-xl shadow-xl p-gap-lg md:p-gap-xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-gap-md mb-gap-md">
                  <div>
                    <div className="flex items-center gap-gap-2xs text-primary font-label-lg text-label-lg uppercase tracking-wider">
                      <Icon className="text-base">lock</Icon>
                      <span>Portal Oficial de Trazabilidad</span>
                    </div>
                    <h2 className="font-headline-md text-headline-md uppercase text-on-surface">
                      Valida o Descarga tu Certificado Oficial de Alturas
                    </h2>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
                    Consulta inmediata para coordinadores HSE, supervisores y técnicos. Ingresa tu tipo y
                    número de documento para validar autenticidad y vigencia técnica.
                  </p>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-12 gap-gap-sm" onSubmit={buscarCertificado}>
                  <div className="md:col-span-4 lg:col-span-3 relative">
                    <select
                      className="w-full h-full min-h-[50px] px-gap-sm py-3 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest transition-all"
                      value={idTipo}
                      onChange={(e) => setIdTipo(e.target.value)}
                      required
                    >
                      <option value="">Tipo de documento...</option>
                      {tiposDoc.map((t) => (
                        <option key={t.id_tipo} value={t.id_tipo}>
                          {t.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-5 lg:col-span-6 relative">
                    <Icon className="absolute left-gap-sm top-1/2 -translate-y-1/2 text-secondary text-xl">badge</Icon>
                    <input
                      className="w-full h-full min-h-[50px] pl-12 pr-gap-sm py-3.5 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-all"
                      placeholder="Ingresa tu número de documento"
                      type="text"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-3 lg:col-span-3">
                    <button
                      className="w-full h-full min-h-[50px] inline-flex items-center justify-center gap-gap-xs px-gap-md py-3 bg-secondary hover:bg-on-secondary-fixed disabled:bg-outline-variant disabled:cursor-not-allowed text-on-secondary font-headline-sm text-headline-sm uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                      type="submit"
                      disabled={!busquedaValida || buscando}
                    >
                      <Icon>search</Icon>
                      <span>{buscando ? "Consultando..." : "Consultar Certificado"}</span>
                    </button>
                  </div>
                </form>

                {errorBusqueda && (
                  <p className="mt-gap-md p-gap-sm rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm">
                    {errorBusqueda}
                  </p>
                )}

                {resultados && resultados.length === 0 && (
                  <div className="mt-gap-md p-gap-md rounded-lg bg-surface-container-high text-center font-body-sm text-body-sm text-on-surface-variant">
                    No se encontraron certificados para ese documento.
                  </div>
                )}

                {resultados && resultados.length > 0 && (
                  <div className="mt-gap-md flex flex-col gap-gap-sm">
                    {resultados.map((cert) => (
                      <div key={cert.id_certificado} className="p-gap-md rounded-lg bg-surface-container-high transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-gap-sm">
                          <div className="flex items-center gap-gap-sm">
                            <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary">
                              <Icon className="text-2xl">verified_user</Icon>
                            </div>
                            <div className="flex flex-col">
                              <span
                                className={`font-label-sm text-label-sm uppercase tracking-widest font-bold ${
                                  cert.vigente ? "text-secondary" : "text-error"
                                }`}
                              >
                                {cert.vigente ? "Registro Vigente Acreditado" : "Certificado Vencido"}
                              </span>
                              <span className="font-headline-sm text-headline-sm text-on-surface uppercase">
                                {cert.curso_nombre}
                              </span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                {cert.codigo} · Emitido {cert.fecha_emision} · Vence {cert.fecha_vencimiento}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-gap-xs">
                            <button
                              className="inline-flex items-center gap-gap-2xs px-gap-sm py-2 bg-primary-container hover:bg-primary disabled:bg-outline-variant disabled:cursor-not-allowed text-on-primary rounded-lg font-label-lg text-label-lg uppercase tracking-wider transition-colors"
                              type="button"
                              onClick={() => descargarCertificado(cert.id_certificado)}
                              disabled={descargandoId === cert.id_certificado}
                            >
                              <Icon className="text-base">file_download</Icon>
                              <span>{descargandoId === cert.id_certificado ? "Descargando..." : "Descargar Carnet PDF"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* CURSOS */}
          <section className="w-full py-gap-3xl px-margin-mobile md:px-margin-tablet lg:px-margin-desktop bg-surface" id="cursos">
            <div className="max-w-max-container mx-auto flex flex-col gap-gap-2xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-gap-md">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-container font-bold">
                    Programas de Formación Certificada
                  </span>
                  <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface mt-gap-2xs">
                    Cursos Especializados en Alturas y Rescate
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  Prácticas inmersivas en torre modular con simuladores hidroneumáticos, anclajes de
                  ingeniería y equipos homologados.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gap-lg">
                {CURSOS.map((curso) => (
                  <div
                    key={curso.titulo}
                    className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-md group hover:shadow-xl transition-all duration-200"
                  >
                    <div className="h-44 w-full relative overflow-hidden bg-surface-container">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={curso.titulo}
                        src={curso.imagen}
                      />
                      <div
                        className={`absolute top-gap-xs left-gap-xs px-gap-xs py-1 rounded font-label-sm text-label-sm uppercase font-bold ${curso.badgeColor}`}
                      >
                        {curso.badge}
                      </div>
                    </div>
                    <div className="p-gap-md flex flex-col flex-1 justify-between gap-gap-sm">
                      <div className="flex flex-col gap-gap-xs">
                        <div className="flex items-center gap-gap-xs text-secondary font-label-sm text-label-sm">
                          <Icon className="text-sm">schedule</Icon>
                          <span>{curso.horas}</span>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface leading-tight">
                          {curso.titulo}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{curso.descripcion}</p>
                        <div className="pt-gap-xs flex flex-col gap-1 text-on-surface font-label-sm text-label-sm">
                          {curso.puntos.map((punto) => (
                            <div key={punto} className="flex items-center gap-1.5">
                              <Icon className="text-xs text-primary">check_circle</Icon> {punto}
                            </div>
                          ))}
                        </div>
                      </div>
                      <a
                        className="mt-gap-sm inline-flex items-center justify-center gap-gap-2xs w-full py-2.5 bg-surface-container-high hover:bg-secondary hover:text-on-secondary text-secondary font-headline-sm text-headline-sm uppercase tracking-wider rounded-lg transition-colors"
                        href="#contacto"
                      >
                        <span>Solicitar Cupo</span>
                        <Icon className="text-base">arrow_forward</Icon>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* EQUIPOS */}
          <section className="w-full py-gap-3xl px-margin-mobile md:px-margin-tablet lg:px-margin-desktop bg-surface-container-low" id="equipos">
            <div className="max-w-max-container mx-auto flex flex-col gap-gap-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-gap-md">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                    Catálogo de Ingeniería Industrial
                  </span>
                  <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface mt-gap-2xs">
                    Equipamiento Homologado ANSI • EN • OSHA
                  </h2>
                </div>
                <a
                  className="inline-flex items-center gap-gap-xs px-gap-md py-2.5 rounded-lg bg-secondary hover:bg-on-secondary-fixed text-on-secondary font-headline-sm text-headline-sm uppercase tracking-wider transition-colors shadow-sm"
                  href="#contacto"
                >
                  <Icon className="text-lg">request_quote</Icon>
                  <span>Cotización Corporativa de Equipos</span>
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-gap-md">
                {EQUIPOS.map((eq) => (
                  <div
                    key={eq.titulo}
                    className="bg-surface-container-lowest p-gap-md rounded-lg flex flex-col gap-gap-sm shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="h-40 w-full rounded bg-surface-container flex items-center justify-center p-gap-xs overflow-hidden">
                      <img className="h-full object-contain" alt={eq.titulo} src={eq.imagen} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-primary font-bold uppercase">{eq.norma}</span>
                      <h4 className="font-headline-sm text-headline-sm uppercase text-on-surface">{eq.titulo}</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{eq.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-on-background text-surface-bright rounded-xl p-gap-lg flex flex-col lg:flex-row items-center justify-between gap-gap-md shadow-lg">
                <div className="flex items-center gap-gap-md">
                  <div className="p-3 bg-primary-container rounded-lg text-on-primary">
                    <Icon className="text-3xl">build_circle</Icon>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-headline-md text-headline-md uppercase">
                      ¿Requieres Inspección Anual de Tus Equipos en Empresa?
                    </h3>
                    <p className="font-body-sm text-body-sm text-surface-dim">
                      Nuestros inspectores de nivel competente auditan arneses, eslingas y puntos de anclaje
                      fijos bajo resolución 4272.
                    </p>
                  </div>
                </div>
                <a
                  className="whitespace-nowrap px-gap-md py-3 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-headline-sm text-headline-sm uppercase tracking-wider transition-colors"
                  href="#contacto"
                >
                  Agendar Auditoría Técnica
                </a>
              </div>
            </div>
          </section>

          {/* BENEFICIOS */}
          <section className="w-full py-gap-3xl px-margin-mobile md:px-margin-tablet lg:px-margin-desktop bg-surface" id="beneficios">
            <div className="max-w-max-container mx-auto flex flex-col gap-gap-2xl">
              <div className="text-center max-w-2xl mx-auto flex flex-col gap-gap-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                  Ventajas y Capacidad Operativa
                </span>
                <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface">
                  ¿Por qué Entrenar con TITAN-ES?
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Desarrollamos rigor técnico con pedagogía industrial diseñada para eliminar de raíz los
                  incidentes de trabajo en altura.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gap-lg">
                <div className="bg-surface-container-low p-gap-lg rounded-xl flex flex-col gap-gap-sm hover:bg-surface-container-high transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                    <Icon className="text-2xl">cloud_upload</Icon>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Torre con Simulación Real</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Estructura certificada de 18 metros con planos inclinados, pasos de hombre y anclajes
                    estructurales dinámicos.
                  </p>
                </div>
                <div className="bg-surface-container-low p-gap-lg rounded-xl flex flex-col gap-gap-sm hover:bg-surface-container-high transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
                    <Icon className="text-2xl">military_tech</Icon>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Instructores IRATA &amp; SPRAT</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Docentes técnicos avalados con experiencia de campo real en hidrocarburos,
                    telecomunicaciones y minería.
                  </p>
                </div>
                <div className="bg-surface-container-low p-gap-lg rounded-xl flex flex-col gap-gap-sm hover:bg-surface-container-high transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-on-background text-surface-bright flex items-center justify-center">
                    <Icon className="text-2xl">qr_code_2</Icon>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Emisión Digital Inmediata</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Al culminar y aprobar, tu credencial se genera en el sistema con verificación por código
                    y descarga inmediata en PDF.
                  </p>
                </div>
                <div className="bg-surface-container-low p-gap-lg rounded-xl flex flex-col gap-gap-sm hover:bg-surface-container-high transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-highest text-secondary flex items-center justify-center">
                    <Icon className="text-2xl">engineering</Icon>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Ingeniería de Accesos</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Consultoría personalizada para instalación y cálculo de líneas de vida horizontales y
                    verticales fijas.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* INSTALACIONES */}
          <section className="w-full py-gap-3xl px-margin-mobile md:px-margin-tablet lg:px-margin-desktop bg-surface-container-low" id="instalaciones">
            <div className="max-w-max-container mx-auto flex flex-col gap-gap-xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-gap-md">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                    Instalaciones de Primer Nivel
                  </span>
                  <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface mt-gap-2xs">
                    Centro de Entrenamiento y Prácticas
                  </h2>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                  Parque Técnico de Ensayos y Formación Avanzada
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-gap-md h-auto md:h-[520px]">
                {INSTALACIONES.map((foto) => (
                  <div
                    key={foto.titulo}
                    className={`${foto.span} relative rounded-xl overflow-hidden shadow-md group ${foto.minH}`}
                  >
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={foto.titulo}
                      src={foto.imagen}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${foto.gradiente} flex items-end p-gap-md`}>
                      <div className="flex flex-col">
                        <span className={`font-label-sm text-label-sm uppercase font-bold ${foto.etiquetaColor}`}>
                          {foto.etiqueta}
                        </span>
                        <h4 className="font-headline-sm text-headline-sm text-surface-bright uppercase">{foto.titulo}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CONTACTO / COTIZACIÓN (real) */}
          <section className="w-full py-gap-3xl px-margin-mobile md:px-margin-tablet lg:px-margin-desktop bg-surface" id="contacto">
            <div className="max-w-max-container mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gap-2xl items-start">
                <div className="lg:col-span-5 flex flex-col gap-gap-lg">
                  <div className="flex flex-col gap-gap-2xs">
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                      Atención Corporativa Inmediata
                    </span>
                    <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface leading-tight">
                      Cotiza Planes Grupales y Asesoría Técnica
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Diseñamos cronogramas de capacitación técnica a la medida de tu proyecto, con
                      flexibilidad de horarios y tarifas corporativas preferenciales.
                    </p>
                  </div>
                  <div className="flex flex-col gap-gap-sm">
                    <div className="flex items-center gap-gap-sm p-gap-md rounded-lg bg-surface-container-low">
                      <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                        <Icon className="text-2xl">pin_drop</Icon>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-primary font-bold uppercase">
                          Sede y Centro de Prácticas
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface">
                          Bogotá D.C. - Autopista Sur Km 8, Parque Industrial A-4
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-gap-sm p-gap-md rounded-lg bg-surface-container-low">
                      <div className="w-12 h-12 rounded-lg bg-on-background text-surface-bright flex items-center justify-center">
                        <Icon className="text-2xl">mail</Icon>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">
                          Correo de Licitaciones y SG-SST
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface">empresas@titan-es.com</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-surface-container-lowest p-gap-lg md:p-gap-xl rounded-xl shadow-xl">
                  {contactoEnviado ? (
                    <div className="flex flex-col items-center text-center gap-gap-sm py-gap-xl">
                      <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                        <Icon className="text-3xl">check_circle</Icon>
                      </div>
                      <h3 className="font-headline-md text-headline-md uppercase text-on-surface">
                        Solicitud enviada con éxito
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                        Un asesor técnico de TITAN-ES revisará tu solicitud y se contactará contigo pronto.
                      </p>
                      <button
                        className="mt-gap-xs px-gap-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline-sm text-headline-sm uppercase tracking-wider transition-colors"
                        onClick={() => setContactoEnviado(false)}
                      >
                        Enviar otra solicitud
                      </button>
                    </div>
                  ) : (
                    <form className="flex flex-col gap-gap-md" onSubmit={enviarContacto}>
                      <h3 className="font-headline-md text-headline-md uppercase text-on-surface">
                        Formulario de Cotización para Empresas
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-gap-md">
                        <div className="flex flex-col gap-1">
                          <label className="font-label-sm text-label-sm uppercase font-bold text-on-surface">
                            Nombre Completo / Contacto *
                          </label>
                          <input
                            className="w-full px-gap-sm py-2.5 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors"
                            placeholder="Ej: Ing. Laura Gómez"
                            required
                            type="text"
                            value={nombreContacto}
                            onChange={(e) => setNombreContacto(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-label-sm text-label-sm uppercase font-bold text-on-surface">
                            Empresa / Razón Social *
                          </label>
                          <input
                            className="w-full px-gap-sm py-2.5 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors"
                            placeholder="Ej: Constructora Andina S.A.S."
                            required
                            type="text"
                            value={empresaContacto}
                            onChange={(e) => setEmpresaContacto(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-gap-md">
                        <div className="flex flex-col gap-1">
                          <label className="font-label-sm text-label-sm uppercase font-bold text-on-surface">
                            Correo Corporativo *
                          </label>
                          <input
                            className="w-full px-gap-sm py-2.5 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors"
                            placeholder="laura.gomez@empresa.com"
                            required
                            type="email"
                            value={correoContacto}
                            onChange={(e) => setCorreoContacto(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-label-sm text-label-sm uppercase font-bold text-on-surface">
                            Teléfono / WhatsApp *
                          </label>
                          <input
                            className="w-full px-gap-sm py-2.5 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors"
                            placeholder="+57 300 000 0000"
                            required
                            type="tel"
                            value={telefonoContacto}
                            onChange={(e) => setTelefonoContacto(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-gap-md">
                        <div className="flex flex-col gap-1">
                          <label className="font-label-sm text-label-sm uppercase font-bold text-on-surface">
                            Tipo de Servicio Requerido *
                          </label>
                          <select
                            className="w-full px-gap-sm py-2.5 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-high transition-colors"
                            value={tipoServicio}
                            onChange={(e) => setTipoServicio(e.target.value)}
                          >
                            {TIPOS_SERVICIO.map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-label-sm text-label-sm uppercase font-bold text-on-surface">
                            Número Estimado de Personal
                          </label>
                          <input
                            className="w-full px-gap-sm py-2.5 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors"
                            min={1}
                            placeholder="Ej: 15 técnicos"
                            type="number"
                            value={numeroPersonal}
                            onChange={(e) => setNumeroPersonal(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm uppercase font-bold text-on-surface">
                          Detalle de la Solicitud / Fechas Estimadas
                        </label>
                        <textarea
                          className="w-full px-gap-sm py-2.5 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors"
                          placeholder="Indica fechas tentativas requeridas, ubicación o detalles del proyecto..."
                          rows={3}
                          value={detalleContacto}
                          onChange={(e) => setDetalleContacto(e.target.value)}
                        />
                      </div>

                      {errorContacto && (
                        <p className="p-gap-sm rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm">
                          {errorContacto}
                        </p>
                      )}

                      <button
                        className="mt-gap-2xs w-full py-3.5 bg-primary-container hover:bg-primary disabled:bg-outline-variant disabled:cursor-not-allowed text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider rounded-lg transition-colors shadow-md"
                        type="submit"
                        disabled={!contactoValido || enviandoContacto}
                      >
                        {enviandoContacto ? "Enviando..." : "Enviar Solicitud de Cotización Inmediata"}
                      </button>
                      <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
                        Tus datos están protegidos conforme a la política de privacidad y protección de datos
                        SG-SST.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full bg-surface-container-low py-gap-2xl mt-gap-3xl">
        <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gap-xl">
          <div className="flex flex-col gap-gap-sm">
            <div className="flex items-center gap-gap-xs">
              <span className="font-headline-sm text-headline-sm uppercase text-primary-container">TITAN-ES</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Centro técnico especializado en protección contra caídas, entrenamiento de acceso por cuerdas y
              rescate industrial certificado bajo normativas internacionales.
            </p>
          </div>
          <div className="flex flex-col gap-gap-sm">
            <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Normativa y Marco Legal</h3>
            <ul className="flex flex-col gap-gap-2xs font-body-sm text-body-sm text-on-surface-variant">
              <li>Resolución 4272 de 2021 (Trabajo Seguro en Alturas)</li>
              <li>OSHA 1926.502 / ANSI Z359.1 Fall Protection Code</li>
              <li>Certificaciones IRATA &amp; SPRAT Internacional</li>
              <li>Auditoría Técnica y Ensayos de Resistencia</li>
            </ul>
          </div>
          <div className="flex flex-col gap-gap-sm">
            <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Operaciones &amp; Sede</h3>
            <div className="flex flex-col gap-gap-2xs font-body-sm text-body-sm text-on-surface-variant">
              <p className="flex items-start gap-gap-xs">
                <Icon className="text-base text-secondary">location_on</Icon>
                <span>Parque Industrial de Alta Seguridad, Torre de Entrenamiento A-4</span>
              </p>
              <p className="flex items-center gap-gap-xs">
                <Icon className="text-base text-secondary">mail</Icon>
                <span>operaciones@titan-es.com</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-gap-sm">
            <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">Acreditación</h3>
            <div className="bg-surface-container-lowest p-gap-sm rounded-lg flex flex-col gap-gap-xs">
              <div className="flex items-center gap-gap-xs text-secondary font-label-md text-label-md uppercase font-bold">
                <Icon className="text-base">verified</Icon>
                <span>Entidad Evaluadora Acreditada</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Verificación digital instantánea de competencias laborales y licencias de trabajo seguro en
                alturas.
              </p>
              <a
                className="inline-flex items-center justify-center gap-gap-2xs px-gap-sm py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg uppercase tracking-wider transition-colors"
                href="#validador"
              >
                <Icon className="text-sm">download</Icon>
                <span>Validar / Descargar Credencial</span>
              </a>
            </div>
          </div>
        </div>
        <div className="w-full px-margin-mobile md:px-margin-tablet lg:px-margin-desktop mt-gap-xl pt-gap-md flex flex-col sm:flex-row justify-between items-center gap-gap-sm font-label-md text-label-md text-on-surface-variant">
          <p>© {new Date().getFullYear()} TITAN-ES Seguridad en Alturas. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
