import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { API_AUTH } from "../../constants/color";
import logo from "../../assets/logo.webp";

function CrearPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const passwordValida = password.length >= 8;
  const coinciden = password === confirmar && confirmar.length > 0;
  const formularioValido = !!token && passwordValida && coinciden;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formularioValido) return;
    setError(null);
    setGuardando(true);
    try {
      await apiFetch(`${API_AUTH}/restablecer-password`, {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setListo(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la contraseña.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col">
      <header className="bg-surface-container-lowest border-b border-outline-variant/40 px-margin-mobile md:px-margin-desktop h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-gap-sm hover:opacity-90 transition-opacity">
          <img src={logo} alt="TITAN-ES" className="h-12 w-auto object-contain" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-margin-mobile py-gap-2xl">
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md p-gap-lg md:p-gap-xl">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-container" />

          {!token ? (
            <div className="flex flex-col items-center text-center gap-gap-sm">
              <span className="material-symbols-outlined text-4xl text-error">error</span>
              <h1 className="font-headline-md text-headline-md uppercase text-on-surface m-0">Enlace incompleto</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant m-0">
                Este enlace no tiene el código necesario. Vuelve a solicitarlo desde{" "}
                <Link to="/olvide-password" className="text-primary font-bold">
                  ¿Olvidaste tu contraseña?
                </Link>
              </p>
            </div>
          ) : listo ? (
            <div className="flex flex-col items-center text-center gap-gap-sm">
              <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h1 className="font-headline-md text-headline-md uppercase text-on-surface m-0">Contraseña creada</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant m-0">
                Ya puedes iniciar sesión con tu nueva contraseña. Te llevamos al login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1 className="font-headline-md text-headline-md uppercase text-on-surface mb-gap-2xs">
                Crea tu contraseña
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-gap-lg">
                Elige una contraseña de al menos 8 caracteres para tu cuenta de TITAN-ES.
              </p>

              <div className="mb-gap-sm">
                <label htmlFor="password" className="font-label-sm text-label-sm uppercase font-bold text-on-surface block mb-1">
                  Nueva contraseña
                </label>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    type={mostrar ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                    className="w-full pl-gap-sm pr-12 py-3 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-high transition-colors"
                  />
                  <button
                    type="button"
                    aria-label="Mostrar u ocultar contraseña"
                    onClick={() => setMostrar((v) => !v)}
                    className="absolute right-gap-2xs text-secondary p-1 rounded"
                  >
                    <span className="material-symbols-outlined text-xl">{mostrar ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              <div className="mb-gap-md">
                <label htmlFor="confirmar" className="font-label-sm text-label-sm uppercase font-bold text-on-surface block mb-1">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmar"
                  type={mostrar ? "text" : "password"}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                  className="w-full px-gap-sm py-3 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-high transition-colors"
                />
                {confirmar.length > 0 && !coinciden && (
                  <p className="text-error font-label-sm text-label-sm mt-1 m-0">Las contraseñas no coinciden.</p>
                )}
              </div>

              {error && (
                <p className="p-gap-sm rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm mb-gap-sm">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!formularioValido || guardando}
                className="w-full py-3.5 bg-primary-container hover:bg-primary disabled:bg-outline-variant disabled:cursor-not-allowed text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider rounded-lg transition-colors shadow-md"
              >
                {guardando ? "Guardando..." : "Guardar contraseña"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default CrearPassword;
