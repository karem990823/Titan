import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ConsultaCertificado from "./ConsultaCertificado";
import { apiFetch } from "../../api/client";

vi.mock("../../api/client", () => ({
  apiFetch: vi.fn(),
  apiFetchBlob: vi.fn(),
  descargarBlob: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const TIPOS_DOC = [{ id_tipo: 1, nombre: "CC" }];

const CERTIFICADO = {
  id_certificado: 1,
  nombre_completo: "Juan Perez",
  curso_nombre: "Trabajador Autorizado",
  codigo: "CERT-002",
  fecha_emision: "2026-01-01",
  fecha_vencimiento: "2027-01-01",
  vigente: true,
};

// Los tipos de documento siempre cargan; la respuesta de la búsqueda la define cada test
function mockApi(buscar: () => Promise<unknown>) {
  apiFetchMock.mockImplementation(async (path: string) => {
    if (path.includes("/publico/buscar")) return buscar();
    return TIPOS_DOC;
  });
}

function renderConsulta() {
  return render(
    <MemoryRouter>
      <ConsultaCertificado />
    </MemoryRouter>,
  );
}

async function llenarYBuscar(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole("option", { name: "CC" });
  await user.selectOptions(screen.getByLabelText("Tipo de documento"), "CC");
  await user.type(screen.getByLabelText("Número de documento"), "1091111111");
  await user.click(screen.getByRole("button", { name: /buscar certificados/i }));
}

describe("ConsultaCertificado", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("mantiene el botón de buscar deshabilitado mientras falte el tipo o el número", async () => {
    // Arrange
    mockApi(async () => ({ data: [] }));
    const user = userEvent.setup();
    renderConsulta();
    const boton = screen.getByRole("button", { name: /buscar certificados/i });

    // Assert: sin nada lleno, deshabilitado
    expect(boton).toBeDisabled();

    // Act: elige solo el tipo de documento
    await screen.findByRole("option", { name: "CC" });
    await user.selectOptions(screen.getByLabelText("Tipo de documento"), "CC");

    // Assert: falta el número, sigue deshabilitado (el borde de la regla)
    expect(boton).toBeDisabled();

    // Act: completa el número
    await user.type(screen.getByLabelText("Número de documento"), "1091111111");

    // Assert: ahora sí se habilita
    expect(boton).toBeEnabled();
  });

  it("muestra el certificado encontrado para el documento", async () => {
    // Arrange
    mockApi(async () => ({ data: [CERTIFICADO] }));
    const user = userEvent.setup();
    renderConsulta();

    // Act
    await llenarYBuscar(user);

    // Assert
    expect(await screen.findByText("Trabajador Autorizado")).toBeInTheDocument();
    expect(screen.getByText(/CERT-002/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /descargar pdf/i })).toBeInTheDocument();
  });

  it("muestra un mensaje cuando el documento no tiene certificados", async () => {
    // Arrange
    mockApi(async () => ({ data: [] }));
    const user = userEvent.setup();
    renderConsulta();

    // Act
    await llenarYBuscar(user);

    // Assert
    expect(
      await screen.findByText("No se encontraron certificados para ese documento."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Trabajador Autorizado")).not.toBeInTheDocument();
  });

  it("muestra el error cuando la búsqueda falla", async () => {
    // Arrange: estado no feliz, la API rechaza la consulta
    mockApi(() => Promise.reject(new Error("Servicio no disponible")));
    const user = userEvent.setup();
    renderConsulta();

    // Act
    await llenarYBuscar(user);

    // Assert
    expect(await screen.findByRole("alert")).toHaveTextContent("Servicio no disponible");
  });
});