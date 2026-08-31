import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Field from "../../components/UI/Field";
import { COLORS, inputStyle } from "../../constants/color";
import { useAuth } from "./useAuth";
import logo from "../../assets/logo.webp";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg,#1B3A6B 0%,#10264A 100%)",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: COLORS.white,
          borderRadius: 12,
          padding: "36px 40px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src={logo} alt="Titan ES" style={{ width: "100%", maxWidth: 160, marginBottom: 12 }} />
          <p style={{ color: COLORS.textSecondary, fontSize: 13, margin: 0 }}>
            Acceso para empresas, instructores y administradores
          </p>
        </div>

        <Field label="Correo" required>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            style={inputStyle}
            required
            autoFocus
          />
        </Field>

        <Field label="Contraseña" required>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
        </Field>

        {error && (
          <p
            style={{
              color: COLORS.errorText,
              background: COLORS.errorBg,
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 13,
              margin: "0 0 16px 0",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
          style={{
            width: "100%",
            background: cargando ? "#ccc" : COLORS.red,
            color: COLORS.white,
            border: "none",
            borderRadius: 8,
            padding: "11px 0",
            fontSize: 14,
            fontWeight: 600,
            cursor: cargando ? "not-allowed" : "pointer",
          }}
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13 }}>
          <Link to="/" style={{ color: COLORS.blue }}>
            ¿Eres participante? Descarga tu certificado aquí
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
