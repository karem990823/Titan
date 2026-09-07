import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";

function Header() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const fecha = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-surface-container-lowest border-b border-outline-variant/40 rounded-xl px-gap-lg py-gap-md mb-gap-lg flex items-center justify-between flex-wrap gap-gap-sm">
      <div>
        <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface m-0">TITAN-ES</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant m-0 capitalize">{fecha}</p>
      </div>

      <div className="flex items-center gap-gap-md">
        <div className="text-right">
          <p className="font-label-lg text-label-lg text-secondary m-0">
            {usuario?.nombre} {usuario?.apellido || ""}
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant m-0 uppercase">{usuario?.rol_nombre}</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-gap-2xs px-gap-sm py-2 rounded-lg border border-outline-variant text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors font-label-lg text-label-lg uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default Header;
