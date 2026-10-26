import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RegistrarTrabajador from "./RegistrarTrabajador";
import { apiFetch } from "../../api/client";

vi.mock("../../api/client", () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const TIPOS_DOC = [{ id_tipo: 1, nombre: "CC" }];

function mockCarga(trabajadoresIniciales: unknown[] = []) {
  apiFetchMock.mockImplementation(async (path: string, options?: RequestInit) => {
    if (path.includes("tipos-identificacion")) return TIPOS_DOC;
    if (path.includes("trabajadores") && (!options || options.method === undefined)) {
      return { success: true, message: "ok", data: trabajadoresIniciales };
    }
    throw new Error(`Llamada no mockeada: ${path}`);
  });
}

// Los campos obligatorios muestran "Campo *" (el asterisco es parte del
// nombre accesible del label), así que buscamos por coincidencia parcial.
function campo(nombre: string) {
  return screen.getByLabelText(nombre, { exact: false });
}

async function llenarFormulario(user: ReturnType<typeof userEvent.setup>) {
  await user.type(campo("Nombre"), "Carlos");
  await user.type(campo("Apellido"), "Perez");
  await user.selectOptions(campo("Tipo de documento"), "CC");
  await user.type(campo("Número de documento"), "1091111111");
}

describe("RegistrarTrabajador", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("muestra el mensaje de lista vacía cuando la empresa no tiene trabajadores", async () => {
    // Arrange
    mockCarga([]);

    // Act
    render(<RegistrarTrabajador onToast={vi.fn()} />);

    // Assert
    expect(await screen.findByText("Aún no has registrado trabajadores.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("muestra un renglón por cada trabajador registrado", async () => {
    // Arrange
    mockCarga([
      { id_usuario: 1, nombre: "Carlos", apellido: "Perez", numero_identificacion: 1091111111, tipo_documento: "CC", direccion: null, telefono: null },
      { id_usuario: 2, nombre: "Laura", apellido: "Gomez", numero_identificacion: 1091111112, tipo_documento: "CC", direccion: null, telefono: null },
    ]);

    // Act
    render(<RegistrarTrabajador onToast={vi.fn()} />);

    // Assert
    const tabla = await screen.findByRole("table");
    const filas = within(tabla).getAllByRole("row");
    expect(filas).toHaveLength(3); // encabezado + 2 trabajadores
    expect(within(tabla).getByText("Carlos Perez")).toBeInTheDocument();
    expect(within(tabla).getByText("Laura Gomez")).toBeInTheDocument();
  });

  it("mantiene el botón de registrar deshabilitado mientras falten campos obligatorios", async () => {
    // Arrange
    mockCarga([]);
    const user = userEvent.setup();
    render(<RegistrarTrabajador onToast={vi.fn()} />);
    await screen.findByText("Aún no has registrado trabajadores.");
    const boton = screen.getByRole("button", { name: "Registrar trabajador" });

    // Assert: sin nada lleno, deshabilitado (valor límite: 0 campos)
    expect(boton).toBeDisabled();

    // Act: llena todo menos el número de documento
    await user.type(campo("Nombre"), "Carlos");
    await user.type(campo("Apellido"), "Perez");
    await user.selectOptions(campo("Tipo de documento"), "CC");

    // Assert: falta un campo obligatorio, sigue deshabilitado (el borde de la regla)
    expect(boton).toBeDisabled();

    // Act: completa el último campo obligatorio
    await user.type(campo("Número de documento"), "1091111111");

    // Assert: ahora sí se habilita
    expect(boton).toBeEnabled();
  });

  it("registra al trabajador, avisa con éxito y limpia el formulario", async () => {
    // Arrange
    mockCarga([]);
    apiFetchMock.mockImplementation(async (path: string, options?: RequestInit) => {
      if (path.includes("tipos-identificacion")) return TIPOS_DOC;
      if (options?.method === "POST") {
        return { success: true, message: "ok", data: { id_usuario: 9, nombre: "Carlos", apellido: "Perez" } };
      }
      return { success: true, message: "ok", data: [] };
    });
    const onToast = vi.fn();
    const user = userEvent.setup();
    render(<RegistrarTrabajador onToast={onToast} />);
    await screen.findByText("Aún no has registrado trabajadores.");

    // Act
    await llenarFormulario(user);
    await user.click(screen.getByRole("button", { name: "Registrar trabajador" }));

    // Assert: aviso de éxito y campos limpios
    expect(onToast).toHaveBeenCalledWith("Trabajador Carlos registrado correctamente.", "success");
    expect(campo("Nombre")).toHaveValue("");
    expect(campo("Número de documento")).toHaveValue(null);
  });

  it("si el registro falla, avisa el error y conserva lo escrito", async () => {
    // Arrange: estado no feliz, la API rechaza el POST
    mockCarga([]);
    apiFetchMock.mockImplementation(async (path: string, options?: RequestInit) => {
      if (path.includes("tipos-identificacion")) return TIPOS_DOC;
      if (options?.method === "POST") {
        throw new Error("Ya existe un trabajador con ese documento");
      }
      return { success: true, message: "ok", data: [] };
    });
    const onToast = vi.fn();
    const user = userEvent.setup();
    render(<RegistrarTrabajador onToast={onToast} />);
    await screen.findByText("Aún no has registrado trabajadores.");

    // Act
    await llenarFormulario(user);
    await user.click(screen.getByRole("button", { name: "Registrar trabajador" }));

    // Assert: aviso de error y el formulario NO se limpia, para no perder lo escrito
    expect(onToast).toHaveBeenCalledWith("Ya existe un trabajador con ese documento", "error");
    expect(campo("Nombre")).toHaveValue("Carlos");
  });
});
