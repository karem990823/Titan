import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";

import OlvidePassword from "./OlvidePassword";
import { server } from "../../test/server";

const RUTA = "*/api/auth/olvide-password";
const CORREO = "ana@correo.com";

function renderPantalla() {
  return render(
    <MemoryRouter>
      <OlvidePassword />
    </MemoryRouter>,
  );
}

async function escribirYEnviar(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/correo electrónico/i), CORREO);
  await user.click(screen.getByRole("button", { name: /enviar enlace de recuperación/i }));
}

describe("OlvidePassword", () => {
  it("mantiene el botón deshabilitado mientras el correo no sea válido", async () => {
    // Arrange
    const user = userEvent.setup();
    renderPantalla();
    const boton = screen.getByRole("button", { name: /enviar enlace de recuperación/i });

    // Assert: vacío
    expect(boton).toBeDisabled();

    // Act: correo sin punto después del @
    await user.type(screen.getByLabelText(/correo electrónico/i), "ana@correo");

    // Assert: sigue deshabilitado (el borde de la regla)
    expect(boton).toBeDisabled();

    // Act: completa el correo
    await user.type(screen.getByLabelText(/correo electrónico/i), ".com");

    // Assert
    expect(boton).toBeEnabled();
  });

  it("envía el correo escrito a la API y muestra el aviso de revisión", async () => {
    // Arrange
    let cuerpo: unknown = null;
    let metodo = "";
    server.use(
      http.post(RUTA, async ({ request }) => {
        metodo = request.method;
        cuerpo = await request.json();
        return HttpResponse.json({ success: true });
      }),
    );
    const user = userEvent.setup();
    renderPantalla();

    // Act
    await escribirYEnviar(user);

    // Assert
    expect(await screen.findByRole("heading", { name: /revisa tu correo/i })).toBeInTheDocument();
    expect(screen.getByText(CORREO)).toBeInTheDocument();
    expect(metodo).toBe("POST");
    expect(cuerpo).toEqual({ correo: CORREO });
  });

  it("muestra el mismo aviso aunque la API responda con error 500", async () => {
    // Arrange: estado no feliz, el backend falla
    server.use(http.post(RUTA, () => HttpResponse.json({ detail: "Fallo interno" }, { status: 500 })));
    const user = userEvent.setup();
    renderPantalla();

    // Act
    await escribirYEnviar(user);

    // Assert: no se revela el error ni se rompe la pantalla
    expect(await screen.findByRole("heading", { name: /revisa tu correo/i })).toBeInTheDocument();
    expect(screen.queryByText("Fallo interno")).not.toBeInTheDocument();
  });

  it("muestra el mismo aviso aunque no haya conexión con el servidor", async () => {
    // Arrange: la red se cae
    server.use(http.post(RUTA, () => HttpResponse.error()));
    const user = userEvent.setup();
    renderPantalla();

    // Act
    await escribirYEnviar(user);

    // Assert
    expect(await screen.findByRole("heading", { name: /revisa tu correo/i })).toBeInTheDocument();
  });

  it("no llama a la API cuando el correo no es válido", async () => {
    // Arrange
    let llamadas = 0;
    server.use(
      http.post(RUTA, () => {
        llamadas += 1;
        return HttpResponse.json({ success: true });
      }),
    );
    const user = userEvent.setup();
    renderPantalla();

    // Act
    await user.type(screen.getByLabelText(/correo electrónico/i), "sin-arroba.com");
    await user.click(screen.getByRole("button", { name: /enviar enlace de recuperación/i }));

    // Assert
    expect(llamadas).toBe(0);
    expect(screen.queryByRole("heading", { name: /revisa tu correo/i })).not.toBeInTheDocument();
  });
});
