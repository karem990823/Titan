import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import ConfirmModal from "../../components/UI/ConfirmModal";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_FACTURAS, API_METODOS_PAGO, API_PAGOS, API_USUARIOS, COLORS, inputStyle } from "../../constants/color";
import type { ApiResponse, EstadoFactura, FacturaResumen, MetodoPago, Pago, ToastType, UsuarioAdmin } from "../../types";

interface FacturacionProps {
  onToast: (message: string, type: ToastType) => void;
}

const ESTADO_LABEL: Record<EstadoFactura, string> = {
  pagada: "Pagada",
  parcial: "Pago parcial",
  pendiente: "Pendiente",
};

const ESTADO_COLOR: Record<EstadoFactura, { bg: string; text: string }> = {
  pagada: { bg: COLORS.successBg, text: COLORS.successText },
  parcial: { bg: COLORS.warningBg, text: COLORS.warningText },
  pendiente: { bg: COLORS.errorBg, text: COLORS.errorText },
};

function Facturacion({ onToast }: FacturacionProps) {
  const [facturas, setFacturas] = useState<FacturaResumen[]>([]);
  const [empresas, setEmpresas] = useState<UsuarioAdmin[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);

  const [pagoEditando, setPagoEditando] = useState<Pago | null>(null);
  const [montoEdicion, setMontoEdicion] = useState("");
  const [metodoEdicion, setMetodoEdicion] = useState("");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [pagoAEliminar, setPagoAEliminar] = useState<Pago | null>(null);
  const [eliminandoPago, setEliminandoPago] = useState(false);

  const [nombreMetodoNuevo, setNombreMetodoNuevo] = useState("");
  const [guardandoMetodoNuevo, setGuardandoMetodoNuevo] = useState(false);
  const [metodoEditando, setMetodoEditando] = useState<MetodoPago | null>(null);
  const [nombreMetodoEdicion, setNombreMetodoEdicion] = useState("");
  const [guardandoMetodoEdicion, setGuardandoMetodoEdicion] = useState(false);
  const [metodoAEliminar, setMetodoAEliminar] = useState<MetodoPago | null>(null);
  const [eliminandoMetodo, setEliminandoMetodo] = useState(false);

  const [idEmpresa, setIdEmpresa] = useState("");
  const [numeroFacturaExterna, setNumeroFacturaExterna] = useState("");
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [valor, setValor] = useState("");
  const [guardandoFactura, setGuardandoFactura] = useState(false);

  const [idFacturaPago, setIdFacturaPago] = useState("");
  const [fechaPago, setFechaPago] = useState("");
  const [montoPago, setMontoPago] = useState("");
  const [idMetodo, setIdMetodo] = useState("");
  const [guardandoPago, setGuardandoPago] = useState(false);

  const cargarFacturas = () => {
    apiFetch<ApiResponse<FacturaResumen[]>>(`${API_FACTURAS}/`)
      .then((res) => setFacturas(res.data))
      .catch(() => onToast("No se pudieron cargar las facturas.", "error"));
  };

  const cargarPagos = () => {
    apiFetch<ApiResponse<Pago[]>>(`${API_PAGOS}/`)
      .then((res) => setPagos(res.data))
      .catch(() => onToast("No se pudieron cargar los pagos.", "error"));
  };

  const cargarMetodosPago = () => {
    apiFetch<ApiResponse<MetodoPago[]>>(`${API_METODOS_PAGO}/`)
      .then((res) => setMetodosPago(res.data))
      .catch(() => onToast("No se pudieron cargar los métodos de pago.", "error"));
  };

  useEffect(() => {
    cargarFacturas();
    cargarPagos();
    cargarMetodosPago();
    apiFetch<ApiResponse<UsuarioAdmin[]>>(`${API_USUARIOS}/?tipo_registro=empresa`).then((res) => setEmpresas(res.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const crearFactura = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoFactura(true);
    try {
      await apiFetch(`${API_FACTURAS}/`, {
        method: "POST",
        body: JSON.stringify({
          id_empresa: parseInt(idEmpresa),
          fecha,
          numero_factura_externa: numeroFacturaExterna || null,
          detalles: descripcion ? [{ descripcion, valor: parseFloat(valor) }] : [],
        }),
      });
      onToast("Factura registrada correctamente.", "success");
      setIdEmpresa("");
      setNumeroFacturaExterna("");
      setFecha("");
      setDescripcion("");
      setValor("");
      cargarFacturas();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardandoFactura(false);
    }
  };

  const registrarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoPago(true);
    try {
      await apiFetch(`${API_PAGOS}/`, {
        method: "POST",
        body: JSON.stringify({
          id_factura: parseInt(idFacturaPago),
          fecha: fechaPago,
          monto: parseFloat(montoPago),
          id_metodo: parseInt(idMetodo),
        }),
      });
      onToast("Pago registrado correctamente.", "success");
      setIdFacturaPago("");
      setFechaPago("");
      setMontoPago("");
      setIdMetodo("");
      cargarFacturas();
      cargarPagos();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardandoPago(false);
    }
  };

  const abrirEdicionPago = (pago: Pago) => {
    setPagoEditando(pago);
    setMontoEdicion(String(pago.monto));
    setMetodoEdicion(String(pago.id_metodo));
  };

  const guardarEdicionPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagoEditando) return;
    setGuardandoEdicion(true);
    try {
      await apiFetch(`${API_PAGOS}/${pagoEditando.id_pago}`, {
        method: "PUT",
        body: JSON.stringify({
          monto: parseFloat(montoEdicion),
          id_metodo: parseInt(metodoEdicion),
        }),
      });
      onToast("Pago actualizado correctamente.", "success");
      setPagoEditando(null);
      cargarFacturas();
      cargarPagos();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const confirmarEliminarPago = async () => {
    if (!pagoAEliminar) return;
    setEliminandoPago(true);
    try {
      await apiFetch(`${API_PAGOS}/${pagoAEliminar.id_pago}`, { method: "DELETE" });
      onToast("Pago eliminado correctamente.", "success");
      cargarFacturas();
      cargarPagos();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setEliminandoPago(false);
      setPagoAEliminar(null);
    }
  };

  const etiquetaFactura = (idFactura: number) => {
    const f = facturas.find((x) => x.id_factura === idFactura);
    return f ? (f.numero_factura_externa || `#${f.id_factura}`) : `#${idFactura}`;
  };

  const crearMetodo = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoMetodoNuevo(true);
    try {
      await apiFetch(`${API_METODOS_PAGO}/`, {
        method: "POST",
        body: JSON.stringify({ nombre: nombreMetodoNuevo }),
      });
      onToast("Método de pago creado correctamente.", "success");
      setNombreMetodoNuevo("");
      cargarMetodosPago();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardandoMetodoNuevo(false);
    }
  };

  const abrirEdicionMetodo = (metodo: MetodoPago) => {
    setMetodoEditando(metodo);
    setNombreMetodoEdicion(metodo.nombre);
  };

  const guardarEdicionMetodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metodoEditando) return;
    setGuardandoMetodoEdicion(true);
    try {
      await apiFetch(`${API_METODOS_PAGO}/${metodoEditando.id_metodo}`, {
        method: "PUT",
        body: JSON.stringify({ nombre: nombreMetodoEdicion }),
      });
      onToast("Método de pago actualizado correctamente.", "success");
      setMetodoEditando(null);
      cargarMetodosPago();
      cargarPagos();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardandoMetodoEdicion(false);
    }
  };

  const confirmarEliminarMetodo = async () => {
    if (!metodoAEliminar) return;
    setEliminandoMetodo(true);
    try {
      await apiFetch(`${API_METODOS_PAGO}/${metodoAEliminar.id_metodo}`, { method: "DELETE" });
      onToast("Método de pago eliminado correctamente.", "success");
      cargarMetodosPago();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setEliminandoMetodo(false);
      setMetodoAEliminar(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Facturación"
        subtitle="Seguimiento del balance de las facturas ya emitidas en Facturatech, por empresa. Este apartado no genera ni reemplaza la facturación real — es un registro interno de montos y pagos."
      />

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: "1 1 360px", maxWidth: 440 }}>
          <form onSubmit={crearFactura} style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0" }}>Registrar factura de Facturatech</p>
            <Field label="Empresa" required>
              <select value={idEmpresa} onChange={(e) => setIdEmpresa(e.target.value)} style={{ ...inputStyle, appearance: "none" }} required>
                <option value="">Seleccionar...</option>
                {empresas.map((emp) => (
                  <option key={emp.id_usuario} value={emp.id_usuario}>{emp.nombre}</option>
                ))}
              </select>
            </Field>
            <Field label="N° de factura en Facturatech">
              <input value={numeroFacturaExterna} onChange={(e) => setNumeroFacturaExterna(e.target.value)} placeholder="Ej: FT-2026-0143" style={inputStyle} />
            </Field>
            <Field label="Fecha" required>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} required />
            </Field>
            <Field label="Concepto">
              <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Curso Trabajador Autorizado x 5" style={inputStyle} />
            </Field>
            <Field label="Valor">
              <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} style={inputStyle} />
            </Field>
            <button type="submit" disabled={guardandoFactura} style={{
              background: guardandoFactura ? "#ccc" : COLORS.red, color: COLORS.white, border: "none",
              borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600,
              cursor: guardandoFactura ? "not-allowed" : "pointer",
            }}>
              {guardandoFactura ? "Guardando..." : "Registrar factura"}
            </button>
          </form>

          <form onSubmit={registrarPago} style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0" }}>Registrar pago recibido</p>
            <Field label="Factura" required>
              <select value={idFacturaPago} onChange={(e) => setIdFacturaPago(e.target.value)} style={{ ...inputStyle, appearance: "none" }} required>
                <option value="">Seleccionar...</option>
                {facturas.map((f) => (
                  <option key={f.id_factura} value={f.id_factura}>
                    {f.numero_factura_externa || `#${f.id_factura}`} · {f.empresa} · saldo ${f.saldo_pendiente}
                  </option>
                ))}
              </select>
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <Field label="Fecha" required>
                <input type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} style={inputStyle} required />
              </Field>
              <Field label="Monto" required>
                <input type="number" step="0.01" value={montoPago} onChange={(e) => setMontoPago(e.target.value)} style={inputStyle} required />
              </Field>
            </div>
            <Field label="Método de pago" required>
              <select value={idMetodo} onChange={(e) => setIdMetodo(e.target.value)} style={{ ...inputStyle, appearance: "none" }} required>
                <option value="">Seleccionar...</option>
                {metodosPago.map((m) => (
                  <option key={m.id_metodo} value={m.id_metodo}>{m.nombre}</option>
                ))}
              </select>
            </Field>
            <button type="submit" disabled={guardandoPago} style={{
              background: guardandoPago ? "#ccc" : COLORS.blue, color: COLORS.white, border: "none",
              borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600,
              cursor: guardandoPago ? "not-allowed" : "pointer",
            }}>
              {guardandoPago ? "Registrando..." : "Registrar pago"}
            </button>
          </form>

          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 6px 0" }}>Métodos de pago</p>
            <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: "0 0 14px 0" }}>
              Catálogo de métodos disponibles al registrar un pago (efectivo, transferencia, tarjeta, etc.).
            </p>

            {metodosPago.length === 0 ? (
              <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: "0 0 14px 0" }}>Aún no hay métodos de pago registrados.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                {metodosPago.map((m) => (
                  <div key={m.id_metodo} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                    background: COLORS.lightGray, borderRadius: 8, padding: "8px 12px", fontSize: 13,
                  }}>
                    <span>{m.nombre}</span>
                    <span style={{ flexShrink: 0 }}>
                      <button onClick={() => abrirEdicionMetodo(m)} style={{
                        background: "none", color: COLORS.blue, border: "none",
                        fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "2px 6px",
                      }}>
                        Editar
                      </button>
                      <button onClick={() => setMetodoAEliminar(m)} style={{
                        background: "none", color: COLORS.red, border: "none",
                        fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "2px 6px",
                      }}>
                        Eliminar
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={crearMetodo} style={{ display: "flex", gap: 8 }}>
              <input
                value={nombreMetodoNuevo}
                onChange={(e) => setNombreMetodoNuevo(e.target.value)}
                placeholder="Ej: Pago móvil"
                style={{ ...inputStyle, flex: 1 }}
                required
              />
              <button type="submit" disabled={guardandoMetodoNuevo} style={{
                background: guardandoMetodoNuevo ? "#ccc" : COLORS.blue, color: COLORS.white, border: "none",
                borderRadius: 8, padding: "0 16px", fontSize: 13, fontWeight: 600,
                cursor: guardandoMetodoNuevo ? "not-allowed" : "pointer", flexShrink: 0,
              }}>
                {guardandoMetodoNuevo ? "Agregando..." : "Agregar"}
              </button>
            </form>
          </div>
        </div>

        <div style={{ flex: "1 1 380px" }}>
          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, overflow: "hidden" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: 0, padding: "16px 20px", borderBottom: `1px solid ${COLORS.borderGray}` }}>
              Balance por factura ({facturas.length})
            </p>
            {facturas.length === 0 ? (
              <p style={{ color: COLORS.textSecondary, fontSize: 14, padding: 24, margin: 0 }}>
                Aún no hay facturas registradas. Regístralas aquí a medida que se emitan en Facturatech para llevar el balance.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: COLORS.lightGray, textAlign: "left" }}>
                    <th style={{ padding: "10px 14px" }}>N° Facturatech</th>
                    <th style={{ padding: "10px 14px" }}>Empresa</th>
                    <th style={{ padding: "10px 14px" }}>Fecha</th>
                    <th style={{ padding: "10px 14px" }}>Total</th>
                    <th style={{ padding: "10px 14px" }}>Saldo</th>
                    <th style={{ padding: "10px 14px" }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.map((f) => (
                    <tr key={f.id_factura} style={{ borderTop: `1px solid ${COLORS.borderGray}` }}>
                      <td style={{ padding: "10px 14px" }}>{f.numero_factura_externa || `#${f.id_factura}`}</td>
                      <td style={{ padding: "10px 14px" }}>{f.empresa}</td>
                      <td style={{ padding: "10px 14px" }}>{f.fecha}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: COLORS.blue }}>${f.total}</td>
                      <td style={{ padding: "10px 14px" }}>${f.saldo_pendiente}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
                          background: ESTADO_COLOR[f.estado].bg, color: ESTADO_COLOR[f.estado].text,
                        }}>
                          {ESTADO_LABEL[f.estado]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, overflow: "hidden", marginTop: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: 0, padding: "16px 20px", borderBottom: `1px solid ${COLORS.borderGray}` }}>
              Pagos registrados ({pagos.length})
            </p>
            {pagos.length === 0 ? (
              <p style={{ color: COLORS.textSecondary, fontSize: 14, padding: 24, margin: 0 }}>
                Aún no se ha registrado ningún pago.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: COLORS.lightGray, textAlign: "left" }}>
                    <th style={{ padding: "10px 14px" }}>Factura</th>
                    <th style={{ padding: "10px 14px" }}>Fecha</th>
                    <th style={{ padding: "10px 14px" }}>Monto</th>
                    <th style={{ padding: "10px 14px" }}>Método de pago</th>
                    <th style={{ padding: "10px 14px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((p) => (
                    <tr key={p.id_pago} style={{ borderTop: `1px solid ${COLORS.borderGray}` }}>
                      <td style={{ padding: "10px 14px" }}>{etiquetaFactura(p.id_factura)}</td>
                      <td style={{ padding: "10px 14px" }}>{p.fecha}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: COLORS.blue }}>${p.monto}</td>
                      <td style={{ padding: "10px 14px" }}>{p.metodo_pago || "—"}</td>
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => abrirEdicionPago(p)}
                          style={{
                            background: "none", color: COLORS.blue, border: "none",
                            fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 6px",
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setPagoAEliminar(p)}
                          style={{
                            background: "none", color: COLORS.red, border: "none",
                            fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 6px",
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {pagoEditando && (
        <div
          onClick={() => setPagoEditando(null)}
          style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={guardarEdicionPago}
            style={{ background: COLORS.white, borderRadius: 12, padding: "24px 28px", width: "100%", maxWidth: 380 }}
          >
            <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 14px 0" }}>
              Editar pago de {etiquetaFactura(pagoEditando.id_factura)}
            </p>
            <Field label="Monto" required>
              <input type="number" step="0.01" value={montoEdicion} onChange={(e) => setMontoEdicion(e.target.value)} style={inputStyle} required />
            </Field>
            <Field label="Método de pago" required>
              <select value={metodoEdicion} onChange={(e) => setMetodoEdicion(e.target.value)} style={{ ...inputStyle, appearance: "none" }} required>
                {metodosPago.map((m) => (
                  <option key={m.id_metodo} value={m.id_metodo}>{m.nombre}</option>
                ))}
              </select>
            </Field>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
              <button type="button" onClick={() => setPagoEditando(null)} style={{
                background: COLORS.lightGray, border: `1px solid ${COLORS.borderGray}`, borderRadius: 8,
                padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: COLORS.textPrimary,
              }}>
                Cancelar
              </button>
              <button type="submit" disabled={guardandoEdicion} style={{
                background: guardandoEdicion ? "#ccc" : COLORS.blue, color: COLORS.white, border: "none",
                borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600,
                cursor: guardandoEdicion ? "not-allowed" : "pointer",
              }}>
                {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={pagoAEliminar !== null}
        title="Eliminar pago"
        message={pagoAEliminar ? `Se eliminará el pago de $${pagoAEliminar.monto} registrado para ${etiquetaFactura(pagoAEliminar.id_factura)}. Esta acción no se puede deshacer.` : ""}
        confirmLabel={eliminandoPago ? "Eliminando..." : "Eliminar"}
        onCancel={() => setPagoAEliminar(null)}
        onConfirm={confirmarEliminarPago}
      />

      {metodoEditando && (
        <div
          onClick={() => setMetodoEditando(null)}
          style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={guardarEdicionMetodo}
            style={{ background: COLORS.white, borderRadius: 12, padding: "24px 28px", width: "100%", maxWidth: 380 }}
          >
            <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 14px 0" }}>Editar método de pago</p>
            <Field label="Nombre" required>
              <input value={nombreMetodoEdicion} onChange={(e) => setNombreMetodoEdicion(e.target.value)} style={inputStyle} required />
            </Field>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
              <button type="button" onClick={() => setMetodoEditando(null)} style={{
                background: COLORS.lightGray, border: `1px solid ${COLORS.borderGray}`, borderRadius: 8,
                padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: COLORS.textPrimary,
              }}>
                Cancelar
              </button>
              <button type="submit" disabled={guardandoMetodoEdicion} style={{
                background: guardandoMetodoEdicion ? "#ccc" : COLORS.blue, color: COLORS.white, border: "none",
                borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600,
                cursor: guardandoMetodoEdicion ? "not-allowed" : "pointer",
              }}>
                {guardandoMetodoEdicion ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={metodoAEliminar !== null}
        title="Eliminar método de pago"
        message={metodoAEliminar ? `Se eliminará "${metodoAEliminar.nombre}". Si tiene pagos registrados asociados, el servidor rechazará la eliminación.` : ""}
        confirmLabel={eliminandoMetodo ? "Eliminando..." : "Eliminar"}
        onCancel={() => setMetodoAEliminar(null)}
        onConfirm={confirmarEliminarMetodo}
      />
    </div>
  );
}

export default Facturacion;
