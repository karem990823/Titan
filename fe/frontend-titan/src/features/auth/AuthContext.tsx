import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, clearToken, getToken, setToken as guardarToken } from "../../api/client";
import { API_AUTH } from "../../constants/color";
import type { ApiResponse, UsuarioAutenticado } from "../../types";

interface AuthContextValue {
  usuario: UsuarioAutenticado | null;
  cargando: boolean;
  login: (correo: string, password: string) => Promise<UsuarioAutenticado>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCargando(false);
      return;
    }

    apiFetch<ApiResponse<UsuarioAutenticado>>(`${API_AUTH}/me`)
      .then((res) => {
        if (res.success) setUsuario(res.data);
        else clearToken();
      })
      .catch(() => clearToken())
      .finally(() => setCargando(false));
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
