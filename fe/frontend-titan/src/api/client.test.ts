import { beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";

import { server } from "../test/server";
import { ApiError, apiFetch, apiFetchBlob, getToken, setToken } from "./client";

describe("apiFetch", () => {
  beforeEach(() => {
    localStorage.clear();
    // Estar en /login evita que la sesión expirada intente redirigir la página
    window.history.pushState({}, "", "/login");
  });

  it("devuelve el JSON cuando la API responde bien", async () => {
    // Arrange
    server.use(http.get("*/api/prueba", () => HttpResponse.json({ data: [1, 2] })));

    // Act
    const resultado = await apiFetch<{ data: number[] }>("/api/prueba");

    // Assert
    expect(resultado).toEqual({ data: [1, 2] });
  });

  it("envía el token de sesión en el encabezado Authorization", async () => {
    // Arrange
    setToken("abc123");
    let autorizacion: string | null = null;
    server.use(
      http.get("*/api/prueba", ({ request }) => {
        autorizacion = request.headers.get("authorization");
        return HttpResponse.json({});
      }),
    );

    // Act
    await apiFetch("/api/prueba");

    // Assert
    expect(autorizacion).toBe("Bearer abc123");
  });

  it("no envía Authorization cuando no hay sesión", async () => {
    // Arrange
    let autorizacion: string | null = "pendiente";
    server.use(
      http.get("*/api/prueba", ({ request }) => {
        autorizacion = request.headers.get("authorization");
        return HttpResponse.json({});
      }),
    );

    // Act
    await apiFetch("/api/prueba");

    // Assert
    expect(autorizacion).toBeNull();
  });

  it("devuelve undefined cuando la respuesta no trae JSON", async () => {
    // Arrange
    server.use(http.delete("*/api/prueba", () => new HttpResponse(null, { status: 204 })));

    // Act
    const resultado = await apiFetch("/api/prueba", { method: "DELETE" });

    // Assert
    expect(resultado).toBeUndefined();
  });

  it("muestra el detail de FastAPI cuando es un texto", async () => {
    // Arrange
    server.use(
      http.post("*/api/prueba", () =>
        HttpResponse.json({ detail: "Credenciales inválidas" }, { status: 400 }),
      ),
    );

    // Act
    const promesa = apiFetch("/api/prueba", { method: "POST" });

    // Assert
    await expect(promesa).rejects.toMatchObject({
      message: "Credenciales inválidas",
      status: 400,
    });
    await expect(promesa).rejects.toBeInstanceOf(ApiError);
  });

  it("muestra el error del detail cuando viene como objeto", async () => {
    // Arrange
    server.use(
      http.post("*/api/prueba", () =>
        HttpResponse.json({ detail: { error: "Correo ya registrado" } }, { status: 409 }),
      ),
    );

    // Act + Assert
    await expect(apiFetch("/api/prueba", { method: "POST" })).rejects.toMatchObject({
      message: "Correo ya registrado",
      status: 409,
    });
  });

  it("usa el message del envelope cuando no hay detail", async () => {
    // Arrange
    server.use(
      http.get("*/api/prueba", () =>
        HttpResponse.json({ success: false, message: "Trabajador no encontrado" }, { status: 404 }),
      ),
    );

    // Act + Assert
    await expect(apiFetch("/api/prueba")).rejects.toMatchObject({
      message: "Trabajador no encontrado",
      status: 404,
    });
  });

  it("usa un mensaje genérico cuando el error no trae JSON", async () => {
    // Arrange: el servidor se cae y responde texto plano
    server.use(http.get("*/api/prueba", () => new HttpResponse("boom", { status: 500 })));

    // Act + Assert
    await expect(apiFetch("/api/prueba")).rejects.toMatchObject({
      message: "Error 500",
      status: 500,
    });
  });

  it("con 401 borra el token y avisa que la sesión expiró", async () => {
    // Arrange
    setToken("vencido");
    server.use(http.get("*/api/prueba", () => new HttpResponse(null, { status: 401 })));

    // Act + Assert
    await expect(apiFetch("/api/prueba")).rejects.toMatchObject({
      message: "Sesión expirada. Inicia sesión nuevamente.",
      status: 401,
    });
    expect(getToken()).toBeNull();
  });

  it("deja pasar el error cuando no hay conexión con el servidor", async () => {
    // Arrange: la red falla por completo
    server.use(http.get("*/api/prueba", () => HttpResponse.error()));

    // Act + Assert
    await expect(apiFetch("/api/prueba")).rejects.toThrow();
  });
});

describe("apiFetchBlob", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, "", "/login");
  });

  it("devuelve el archivo cuando la descarga sale bien", async () => {
    // Arrange
    server.use(
      http.get(
        "*/api/archivo",
        () => new HttpResponse("pdf-falso", { headers: { "Content-Type": "application/pdf" } }),
      ),
    );

    // Act
    const blob = await apiFetchBlob("/api/archivo");

    // Assert
    expect(await blob.text()).toBe("pdf-falso");
  });

  it("falla con el código de estado cuando el archivo no existe", async () => {
    // Arrange
    server.use(http.get("*/api/archivo", () => new HttpResponse(null, { status: 404 })));

    // Act + Assert
    await expect(apiFetchBlob("/api/archivo")).rejects.toMatchObject({
      message: "Error 404",
      status: 404,
    });
  });

  it("con 401 borra el token y avisa que la sesión expiró", async () => {
    // Arrange
    setToken("vencido");
    server.use(http.get("*/api/archivo", () => new HttpResponse(null, { status: 401 })));

    // Act + Assert
    await expect(apiFetchBlob("/api/archivo")).rejects.toMatchObject({ status: 401 });
    expect(getToken()).toBeNull();
  });
});
