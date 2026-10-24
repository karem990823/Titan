export const LARGO_MINIMO_PASSWORD = 8;

export function esPasswordValida(password: string): boolean {
  return password.length >= LARGO_MINIMO_PASSWORD;
}

export function passwordsCoinciden(password: string, confirmar: string): boolean {
  return password === confirmar && confirmar.length > 0;
}

export function esCorreoValido(correo: string): boolean {
  return /^\S+@\S+\.\S+$/.test(correo);
}