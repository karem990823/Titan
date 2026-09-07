import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { API_AUTH } from "../../constants/color";
import logo from "../../assets/logo.webp";

function OlvidePassword() {
  const [correo, setCorreo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const correoValido = /^\S+@\S+\.\S+$/.test(correo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correoValido) return;
    setEnviando(true);
    try {
      await apiFetch(`${API_AUTH}/olvide-password`, {
        method: "POST",
        body: JSON.stringify({ correo }),
      });
    } catch {
      // Se ignora a propósito: el backend siempre responde igual, exista o
      // no el correo, para no revelar qué cuentas están registradas.
    } finally {
      setEnviando(false);
      setEnviado(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col">
      <header className="bg-surface-container-lowest border-b border-outline-variant/40 px-margin-mobile md:px-margin-desktop h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-gap-sm hover:opacity-90 transition-opacity">
          <img src={logo} alt="TITAN-ES" className="h-12 w-auto object-contain" />
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-gap-xs px-gap-sm py-2 rounded-lg text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors font-headline-sm text-label-lg uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver al inicio de sesión
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-margin-mobile py-gap-2xl">
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md p-gap-lg md:p-gap-xl">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-container" />

          {enviado ? (
            <div className="flex flex-col items-center text-center gap-gap-sm">
              <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">mark_email_read</span>
              </div>
              <h1 className="font-headline-md text-headline-md uppercase text-on-surface m-0">Revisa tu correo</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant m-0">
                Si <strong>{correo}</strong> está registrado en el sistema, te enviamos un enlace para restablecer tu
                contraseña. Revisa también la carpeta de spam.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1 className="font-headline-md text-headline-md uppercase text-on-surface mb-gap-2xs">
                ¿Olvidaste tu contraseña?
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-gap-lg">
                Escribe el correo con el que te registraste y te enviaremos un enlace para restablecerla.
              </p>

              <label htmlFor="correo-olvide" className="font-label-sm text-label-sm uppercase font-bold text-on-surface block mb-1">
                Correo electrónico
              </label>
              <input
                id="correo-olvide"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@correo.com"
                autoFocus
                required
                className="w-full px-gap-sm py-3 bg-surface-container-low rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors mb-gap-md"
              />

              <button
                type="submit"
                disabled={!correoValido || enviando}
                className="w-full py-3.5 bg-primary-container hover:bg-primary disabled:bg-outline-variant disabled:cursor-not-allowed text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider rounded-lg transition-colors shadow-md"
              >
                {enviando ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default OlvidePassword;
