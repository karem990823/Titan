import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { COLORS } from "../../constants/color";
import { useAuth } from "./useAuth";
import logo from "../../assets/logo.webp";

interface Slide {
  badgeIcon: string;
  badgeLabel: string;
  badgeBg: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  stats: { icon: string; label: string }[];
}

const SLIDES: Slide[] = [
  {
    badgeIcon: "verified",
    badgeLabel: "Módulo Acreditado",
    badgeBg: COLORS.red,
    titulo: "Formación Técnica Certificada",
    descripcion:
      "Entrenamiento riguroso en torres de maniobra bajo la Resolución Nacional 4272 de 2021 y el código internacional ANSI Z359.",
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBw7BvDBafR9eSbi3fmPkltCOJ3G2fMuv3ihYH-jf7BHUt9FrIw4VK8br6OtpN1-GR2oZgNOaIa3vHTg7DZ0_YCe0bgoI47fZSUHD1zCHEkUiim6WCBRYc8wqU0IJGmHqh09Ww7ZkdAiZdVGfJkSJDJqcBmINsrrGTZlg4ojr74MFyXeZhkw-IrHI6dNgFo--hCNaUGvHWcwqaRc0sd_i0oqnJGTc6PaMAF3jYvy2Pl9EOHbbzyqJK8",
    stats: [
      { icon: "construction", label: "Nivel Avanzado" },
      { icon: "schedule", label: "40 Horas Prácticas" },
    ],
  },
  {
    badgeIcon: "qr_code_scanner",
    badgeLabel: "Trazabilidad 24/7",
    badgeBg: COLORS.blue,
    titulo: "Gestión y Validación de Certificados QR",
    descripcion:
      "Consulta de carnés de aptitud física y licencias de trabajo seguro en alturas con verificación instantánea de autenticidad para contratistas.",
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBFeaE60OIxMtPgLh7Nd8b87q4057stI9oFBDHLzkMKz7Cyg1PO8bkcgJi7mFtDxIZSGjEajnti4N9T1lM1Qcr8Rz_M2pmj62PcfWENFjavIcDR0cqPQNFooZ2F1tMv98NNHocgr8s6siwgOWJ_EOrDSWZi7Hh-fb-cnOHoISRIRcTnpUTfZ0GsscbtUCykZdvU4nUY8Yzfc9QfEi5udfcW9o98x6Ji2Q1RYkxN90WYukjVC8aw1FS6",
    stats: [
      { icon: "cloud_sync", label: "Sincronización Inmediata" },
      { icon: "shield", label: "Validez Legal Vigente" },
    ],
  },
  {
    badgeIcon: "emergency",
    badgeLabel: "Rescate y Auto-Rescate",
    badgeBg: "#854F0B",
    titulo: "Simuladores Reales de Rescate Vertical",
    descripcion:
      "Infraestructura técnica para maniobras de descenso en espacios confinados, torres eólicas y estructuras metálicas complejas.",
    imagen:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6DJQTcXcIW_dC7jEC0KeITBf7CwfEAmEQBqTuC07YJy3UKheMuQqb81JpEk4wHG9-N9DjHIG6Jnni5rJV2nTMSKyEXyugVU56_hqok8tgQoyuTHhlpvTBRpj9GBS_1NKEdj8CqTolBO7DQA5_9E0-1ad0dyxWw8AqQuxMd3jaJVHtLWRuBEnOBIdzqxKiy90Uq-hl8BdraXpseLQY19hDYsyq7sYDWQdkA8dbyXmaB0QITDEZgeVU",
    stats: [
      { icon: "precision_manufacturing", label: "Torre de 18 Metros" },
      { icon: "military_tech", label: "Protocolos IRATA" },
    ],
  },
];

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [slideActual, setSlideActual] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideActual((actual) => (actual + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const irASlide = (indice: number) => setSlideActual(indice);
  const slideAnterior = () => setSlideActual((actual) => (actual - 1 + SLIDES.length) % SLIDES.length);
  const slideSiguiente = () => setSlideActual((actual) => (actual + 1) % SLIDES.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const usuario = await login(correo, password);
      if (usuario.rol_nombre === "Empresa") {
        navigate("/empresa/trabajadores");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setCargando(false);
    }
  };

  const botonDeshabilitado = cargando || !correo || !password;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.lightGray, display: "flex", flexDirection: "column" }}>
      {/* Encabezado */}
      <header
        style={{
          background: COLORS.white,
          borderBottom: `1px solid ${COLORS.borderGray}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 8,
            border: `1px solid ${COLORS.borderGray}`,
            background: COLORS.lightGray,
            color: COLORS.textPrimary,
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            textDecoration: "none",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            arrow_back
          </span>
          Volver al inicio
        </Link>
        <img src={logo} alt="Titan ES" style={{ height: 40, width: "auto", objectFit: "contain" }} />
      </header>

      {/* Contenido dividido */}
      <main style={{ flex: 1, display: "flex", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 1180, display: "flex", gap: 32, flexWrap: "wrap", alignItems: "stretch" }}>
          {/* Columna izquierda: formulario */}
          <div style={{ flex: "1 1 420px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                background: COLORS.white,
                borderRadius: 12,
                padding: "32px 36px",
                boxShadow: "0 10px 30px rgba(13,28,47,0.10)",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: COLORS.red }} />

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span
                  style={{
                    background: COLORS.blue,
                    color: COLORS.white,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: 4,
                  }}
                >
                  Credenciales Autorizadas
                </span>
                <span style={{ color: COLORS.blue, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                  • Portal v4.8
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "'Oswald', 'Segoe UI', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: COLORS.textPrimary,
                  fontSize: 30,
                  margin: "0 0 8px 0",
                }}
              >
                Acceso a plataforma
              </h1>
              <p style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px 0" }}>
                Ingresa tus credenciales para acceder al portal de certificaciones, historial de reentrenamientos
                técnicos e inspección de equipos de altura.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label htmlFor="login-email" style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>
                      Correo Electrónico
                    </label>
                    <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.blue, textTransform: "uppercase" }}>
                      Requerido
                    </span>
                  </div>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ position: "absolute", left: 12, color: COLORS.blue, fontSize: 20, pointerEvents: "none" }}
                    >
                      mail
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="ejemplo@gmail.com"
                      required
                      autoFocus
                      style={{
                        width: "100%",
                        padding: "11px 14px 11px 42px",
                        fontSize: 14,
                        border: `1px solid ${COLORS.borderGray}`,
                        borderRadius: 8,
                        background: COLORS.lightGray,
                        color: COLORS.textPrimary,
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label htmlFor="login-password" style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>
                      Contraseña
                    </label>
                    <Link to="#" style={{ fontSize: 12, fontWeight: 600, color: COLORS.red, textDecoration: "none" }}>
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ position: "absolute", left: 12, color: COLORS.blue, fontSize: 20, pointerEvents: "none" }}
                    >
                      lock
                    </span>
                    <input
                      id="login-password"
                      type={mostrarPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      style={{
                        width: "100%",
                        padding: "11px 42px 11px 42px",
                        fontSize: 14,
                        border: `1px solid ${COLORS.borderGray}`,
                        borderRadius: 8,
                        background: COLORS.lightGray,
                        color: COLORS.textPrimary,
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Mostrar u ocultar contraseña"
                      onClick={() => setMostrarPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 10,
                        background: "none",
                        border: "none",
                        color: COLORS.blue,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: 4,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        {mostrarPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    style={{
                      color: COLORS.errorText,
                      background: COLORS.errorBg,
                      padding: "10px 14px",
                      borderRadius: 8,
                      fontSize: 13,
                      margin: 0,
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={botonDeshabilitado}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background: botonDeshabilitado ? "#ccc" : COLORS.red,
                    color: COLORS.white,
                    border: "none",
                    borderRadius: 8,
                    padding: "13px 0",
                    fontFamily: "'Oswald', 'Segoe UI', sans-serif",
                    fontSize: 15,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    cursor: botonDeshabilitado ? "not-allowed" : "pointer",
                  }}
                >
                  {cargando ? "Ingresando..." : "Ingresar al sistema"}
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    lock_open
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Columna derecha: carrusel */}
          <div style={{ flex: "1 1 420px", display: "flex" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                minHeight: 480,
                borderRadius: 12,
                overflow: "hidden",
                background: "#10264A",
                boxShadow: "0 10px 30px rgba(13,28,47,0.20)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              {SLIDES.map((slide, indice) => (
                <div
                  key={slide.titulo}
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: indice === slideActual ? 1 : 0,
                    transition: "opacity 0.7s ease-in-out",
                    backgroundImage: `url('${slide.imagen}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(0deg, rgba(16,38,74,0.95) 0%, rgba(16,38,74,0.55) 55%, transparent 100%)",
                }}
              />

              <div style={{ position: "relative", zIndex: 1, padding: "0 32px 64px", color: COLORS.white }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: SLIDES[slideActual].badgeBg,
                    color: COLORS.white,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    padding: "3px 8px",
                    borderRadius: 4,
                    marginBottom: 10,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                    {SLIDES[slideActual].badgeIcon}
                  </span>
                  {SLIDES[slideActual].badgeLabel}
                </span>
                <h3
                  style={{
                    fontFamily: "'Oswald', 'Segoe UI', sans-serif",
                    textTransform: "uppercase",
                    fontSize: 24,
                    fontWeight: 700,
                    margin: "0 0 8px 0",
                  }}
                >
                  {SLIDES[slideActual].titulo}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.9)", maxWidth: 460, margin: 0 }}>
                  {SLIDES[slideActual].descripcion}
                </p>
                <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
                  {SLIDES[slideActual].stats.map((stat) => (
                    <span
                      key={stat.label}
                      style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                        {stat.icon}
                      </span>
                      {stat.label}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  padding: "10px 20px",
                  background: "rgba(16,38,74,0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  {SLIDES.map((slide, indice) => (
                    <button
                      key={slide.titulo}
                      aria-label={`Ir a diapositiva ${indice + 1}`}
                      onClick={() => irASlide(indice)}
                      style={{
                        height: 8,
                        width: indice === slideActual ? 32 : 8,
                        borderRadius: 999,
                        border: "none",
                        background: indice === slideActual ? COLORS.red : "rgba(255,255,255,0.35)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    aria-label="Diapositiva anterior"
                    onClick={slideAnterior}
                    style={carouselArrowStyle}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      chevron_left
                    </span>
                  </button>
                  <button
                    aria-label="Siguiente diapositiva"
                    onClick={slideSiguiente}
                    style={carouselArrowStyle}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const carouselArrowStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "none",
  background: "rgba(255,255,255,0.12)",
  color: COLORS.white,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

export default LoginPage;