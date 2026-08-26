import { useEffect, useState, type ReactNode } from "react";
import { apiFetch, clearToken, getToken, setToken as guardarToken } from "../../api/client";
import { API_AUTH } from "../../constants/color";
import type { ApiResponse, UsuarioAutenticado } from "../../types";
import { AuthContext } from "./authContextObject";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let ignore = false;

    (async () => {
      const token = getToken();
      if (!token) {
        if (!ignore) setCargando(false);
        return;
      }

      try {
        const res = await apiFetch<ApiResponse<UsuarioAutenticado>>(`${API_AUTH}/me`);
        if (ignore) return;
        if (res.success) setUsuario(res.data);
        else clearToken();
      } catch {
        if (!ignore) clearToken();
      } finally {
        if (!ignore) setCargando(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const login = async (correo: string, password: string) => {
    const res = await apiFetch<ApiResponse<{ access_token: string; usuario: UsuarioAutenticado }>>(
      `${API_AUTH}/login`,
      { method: "POST", body: JSON.stringify({ correo, password }) }
    );

    guardarToken(res.data.access_token);
    setUsuario(res.data.usuario);
    return res.data.usuario;
  };

  const logout = () => {
    clearToken();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
