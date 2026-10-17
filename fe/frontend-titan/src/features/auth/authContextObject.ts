import { createContext } from "react";
import type { UsuarioAutenticado } from "../../types";

export interface AuthContextValue {
  usuario: UsuarioAutenticado | null;
  cargando: boolean;
  login: (correo: string, password: string) => Promise<UsuarioAutenticado>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
