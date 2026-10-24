import { describe, it, expect } from "vitest";
import {
  esPasswordValida,
  passwordsCoinciden,
  esCorreoValido,
} from "./validaciones";

describe("esPasswordValida", () => {
  it.each([
    ["1234567", false], // límite: 7 caracteres
    ["12345678", true], // límite: 8 caracteres
    ["123456789", true], // 9 caracteres
    ["", false],
  ])("con '%s' devuelve %s", (password, esperado) => {
    // Act
    const resultado = esPasswordValida(password);
    // Assert
    expect(resultado).toBe(esperado);
  });
});

describe("passwordsCoinciden", () => {
  it.each([
    ["clave1234", "clave1234", true],
    ["clave1234", "clave9999", false],
    ["clave1234", "", false],
    ["", "", false], // ambas vacías no cuentan
  ])("('%s', '%s') devuelve %s", (password, confirmar, esperado) => {
    expect(passwordsCoinciden(password, confirmar)).toBe(esperado);
  });
});

describe("esCorreoValido", () => {
  it.each([
    ["ana@correo.com", true],
    ["sin-arroba.com", false],
    ["ana@correo", false], // sin punto después del @
    ["ana @correo.com", false], // con espacio
    ["", false],
  ])("'%s' devuelve %s", (correo, esperado) => {
    expect(esCorreoValido(correo)).toBe(esperado);
  });
});