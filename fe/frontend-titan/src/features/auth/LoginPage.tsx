import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./useAuth";
import logo from "../../assets/logo.webp";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const correoValido = /^\S+@\S+\.\S+$/.test(correo);
  const formularioValido = correoValido && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formularioValido) return;
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
    <div className="min-h-screen bg-surface-container-low flex flex-col">
      <header className="bg-surface-container-lowest border-b border-outline-variant/40 px-margin-mobile md:px-margin-desktop h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-gap-sm hover:opacity-90 transition-opacity">
          <img src={logo} alt="TITAN-ES" className="h-12 w-auto object-contain" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-gap-xs px-gap-sm py-2 rounded-lg text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors font-headline-sm text-label-lg uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver al inicio
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-margin-mobile py-gap-2xl">
        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md p-gap-lg md:p-gap-xl"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-container" />

          <div className="flex flex-col items-center gap-gap-2xs mb-gap-lg">
            <img src={logo} alt="TITAN-ES" className="h-16 w-auto object-contain mb-gap-2xs" />
            <h1 className="font-headline-md text-headline-md uppercase text-on-surface text-center">
              Acceso a la plataforma
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
              Para empresas, instructores y administradores
            </p>
          </div>

          <div className="flex flex-col gap-gap-md">
            <div>
              <label htmlFor="login-correo" className="font-label-sm text-label-sm uppercase font-bold text-on-surface block mb-1">
                Correo electrónico
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-gap-sm text-secondary text-xl pointer-events-none">
                  mail
                </span>
                <input
                  id="login-correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  autoFocus
                  required
                  className="w-full pl-12 pr-gap-sm py-3 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="font-label-sm text-label-sm uppercase font-bold text-on-surface block mb-1">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-gap-sm text-secondary text-xl pointer-events-none">
                  lock
                </span>
                <input
                  id="login-password"
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors"
                />
                <button
                  type="button"
                  aria-label="Mostrar u ocultar contraseña"
                  onClick={() => setMostrarPassword((v) => !v)}
                  className="absolute right-gap-2xs text-secondary p-1 rounded"
                >
                  <span className="material-symbols-outlined text-xl">
                    {mostrarPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <p className="p-gap-sm rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!formularioValido || cargando}
              className="w-full flex items-center justify-center gap-gap-xs py-3.5 bg-primary-container hover:bg-primary disabled:bg-outline-variant disabled:cursor-not-allowed text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider rounded-lg transition-colors shadow-md"
            >
              {cargando ? "Ingresando..." : "Ingresar al sistema"}
              <span className="material-symbols-outlined text-xl">lock_open</span>
            </button>

            <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
              ¿Eres participante?{" "}
              <Link to="/" className="text-primary font-bold">
                Descarga tu certificado aquí
              </Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}

export default LoginPage;
