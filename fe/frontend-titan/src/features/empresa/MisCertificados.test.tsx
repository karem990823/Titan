import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MisCertificados from "./MisCertificados";
import { apiFetch, apiFetchBlob, descargarBlob } from "../../api/client";

vi.mock("../../api/client", () => ({
  apiFetch: vi.fn(),
  apiFetchBlob: vi.fn(),
  descargarBlob: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);
const apiFetchBlobMock = vi.mocked(apiFetchBlob);
const descargarBlobMock = vi.mocked(descargarBlob);

const CERT_A = {
  id_certificado: 1,
  codigo: "CERT-001",
  curso_nombre: "Trabajador Autorizado",
  fecha_emision: "2026-01-01",
  fecha_vencimiento: "2027-01-01",
};

const CERT_B = {
  id_certificado: 2,
  codigo: "CERT-002",
  curso_nombre: "Trabajo en Alturas",
  fecha_emision: "2026-02-01",
  fecha_vencimiento: "2027-02-01",
};

describe("MisCertificados", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("muestra Cargando... mientras se obtienen los certificados", () => {
    // Arrange: una petición que nunca termina
    apiFetchMock.mockReturnValue(new Promise(() => {}));

    // Act
    render(<MisCertificados onToast={vi.fn()} />);

    // Assert
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("muestra el mensaje de lista vacía cuando no hay certificados", async () => {
    // Arrange
    apiFetchMock.mockResolvedValue({ data: [] });

    // Act
    render(<MisCertificados onToast={vi.fn()} />);

    // Assert
    expect(await screen.findByText("Aún no hay certificados")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /descargar pdf/i })).not.toBeInTheDocument();
  });

  it("muestra un renglón con botón de descarga por cada certificado", async () => {
    // Arrange
    apiFetchMock.mockResolvedValue({ data: [CERT_A, CERT_B] });

    // Act
    render(<MisCertificados onToast={vi.fn()} />);

    // Assert
    expect(await screen.findByText("Trabajador Autorizado")).toBeInTheDocument();
    expect(screen.getByText("Trabajo en Alturas")).toBeInTheDocument();
    expect(screen.getByText(/CERT-001/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /descargar pdf/i })).toHaveLength(2);
  });

  it("descarga el PDF con el código del certificado en el nombre del archivo", async () => {
    // Arrange
    const pdf = new Blob(["pdf"]);
    apiFetchMock.mockResolvedValue({ data: [CERT_A] });
    apiFetchBlobMock.mockResolvedValue(pdf);
    const user = userEvent.setup();
    render(<MisCertificados onToast={vi.fn()} />);

    // Act
    await user.click(await screen.findByRole("button", { name: /descargar pdf/i }));

    // Assert
    await waitFor(() =>
      expect(descargarBlobMock).toHaveBeenCalledWith(pdf, "certificado-CERT-001.pdf"),
    );
    expect(apiFetchBlobMock).toHaveBeenCalledWith(expect.stringContaining("/1/descargar"));
  });

  it("avisa con un error si no se pueden cargar los certificados", async () => {
    // Arrange: estado no feliz, la API falla al cargar
    apiFetchMock.mockRejectedValue(new Error("Sin conexión"));
    const onToast = vi.fn();

    // Act
    render(<MisCertificados onToast={onToast} />);

    // Assert
    await waitFor(() =>
      expect(onToast).toHaveBeenCalledWith("No se pudieron cargar los certificados.", "error"),
    );
    expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
  });

  it("si la descarga falla, avisa el error y vuelve a habilitar el botón", async () => {
    // Arrange: la lista carga bien, pero el PDF falla
    apiFetchMock.mockResolvedValue({ data: [CERT_A] });
    apiFetchBlobMock.mockRejectedValue(new Error("Fallo del servidor"));
    const onToast = vi.fn();
    const user = userEvent.setup();
    render(<MisCertificados onToast={onToast} />);

    // Act
    await user.click(await screen.findByRole("button", { name: /descargar pdf/i }));

    // Assert
    await waitFor(() =>
      expect(onToast).toHaveBeenCalledWith("No se pudo descargar el certificado.", "error"),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /descargar pdf/i })).toBeEnabled(),
    );
    expect(descargarBlobMock).not.toHaveBeenCalled();
  });
});