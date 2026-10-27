import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CrearPassword from "./CrearPassword";
import { apiFetch } from "../../api/client";
import { API_AUTH } from "../../constants/color";

vi.mock("../../api/client", () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

// El enlace del correo trae el token en la URL: ?token=...
function renderizar(ruta = "/crear-password?token=abc123") {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <CrearPassword />
    </MemoryRouter>,
  );
}

const campoPassword = () => screen.getByLabelText("Nueva contraseña");
const campoConfirmar = () => screen.getByLabelText("Confirmar contraseña");
const botonGuardar = () => screen.getByRole("button", { name: "Guardar contraseña" });

describe("CrearPassword", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("sin token en el enlace muestra 'Enlace incompleto' y no el formulario", () => {
    // Arrange + Act
    renderizar("/crear-password");

    // Assert
    expect(screen.getByRole("heading", { name: "Enlace incompleto" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Guardar contraseña" })).not.toBeInTheDocument();
  });

  it.each([
    ["1234567", false], // límite: 7 caracteres, no alcanza
    ["12345678", true], // límite: 8 caracteres, el mínimo
  ])("con '%s' en ambos campos, el botón habilitado es %s", async (password, habilitado) => {
    // Arrange
    const user = userEvent.setup();
    renderizar();

    // Act
    await user.type(campoPassword(), password);
    await user.type(campoConfirmar(), password);

    // Assert
    expect(botonGuardar()).toHaveProperty("disabled", !habilitado);
  });

  it("avisa que no coinciden solo cuando la confirmación tiene texto distinto", async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar();
    await user.type(campoPassword(), "clave1234");

    // Assert: confirmación vacía, todavía no se avisa
    expect(screen.queryByText("Las contraseñas no coinciden.")).not.toBeInTheDocument();

    // Act: escribe una confirmación distinta
    await user.type(campoConfirmar(), "clave9999");

    // Assert: ahora sí avisa y el botón sigue deshabilitado
    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
    expect(botonGuardar()).toBeDisabled();
  });

  it("envía el token y la contraseña y muestra 'Contraseña creada'", async () => {
    // Arrange
    apiFetchMock.mockImplementation(async () => ({ success: true, message: "ok", data: null }));
    const user = userEvent.setup();
    renderizar();

    // Act
    await user.type(campoPassword(), "clave1234");
    await user.type(campoConfirmar(), "clave1234");
    await user.click(botonGuardar());

    // Assert
    expect(apiFetchMock).toHaveBeenCalledWith(`${API_AUTH}/restablecer-password`, {
      method: "POST",
      body: JSON.stringify({ token: "abc123", password: "clave1234" }),
    });
    expect(await screen.findByRole("heading", { name: "Contraseña creada" })).toBeInTheDocument();
  });

  it("si el servidor rechaza, muestra el error y conserva lo escrito", async () => {
    // Arrange: la API rechaza el token
    apiFetchMock.mockRejectedValue(new Error("Token inválido o expirado"));
    const user = userEvent.setup();
    renderizar();

    // Act
    await user.type(campoPassword(), "clave1234");
    await user.type(campoConfirmar(), "clave1234");
    await user.click(botonGuardar());

    // Assert
    expect(await screen.findByText("Token inválido o expirado")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Contraseña creada" })).not.toBeInTheDocument();
    expect(campoPassword()).toHaveValue("clave1234");
  });
});