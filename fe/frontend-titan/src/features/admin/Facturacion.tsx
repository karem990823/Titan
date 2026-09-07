import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import ConfirmModal from "../../components/UI/ConfirmModal";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_FACTURAS, API_METODOS_PAGO, API_PAGOS, API_USUARIOS, inputStyle } from "../../constants/color";
import type { ApiResponse, EstadoFactura, FacturaResumen, MetodoPago, Pago, ToastType, UsuarioAdmin } from "../../types";

interface FacturacionProps {
  onToast: (message: string, type: ToastType) => void;
}

const ESTADO_LABEL: Record<EstadoFactura, string> = {
  pagada: "Pagada",
  parcial: "Pago parcial",
  pendiente: "Pendiente",
};

const ESTADO_COLOR: Record<EstadoFactura, string> = {
  pagada: "bg-green-50 text-green-700",
  parcial: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  pendiente: "bg-error-container text-on-error-container",
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

  const botonFacturaDeshabilitado = guardandoFactura || !idEmpresa || !fecha;
  const botonPagoDeshabilitado = guardandoPago || !idFacturaPago || !fechaPago || !montoPago || !idMetodo;
  const botonMetodoDeshabilitado = guardandoMetodoNuevo || !nombreMetodoNuevo.trim();

  return (
    <div>
      <PageHeader
        title="Facturación"
        subtitle="Seguimiento del balance de las facturas ya emitidas en Facturatech, por empresa. Este apartado no genera ni reemplaza la facturación real — es un registro interno de montos y pagos."
      />

      <div className="flex gap-gap-lg flex-wrap items-start">
        <div className="flex flex-col gap-gap-lg flex-1 min-w-[360px] max-w-lg">
          <form onSubmit={crearFactura} className="bg-surface-container-lowest rounded-xl p-gap-lg">
            <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">Registrar factura de Facturatech</p>
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
            <button
              type="submit"
              disabled={botonFacturaDeshabilitado}
              className={`px-gap-md py-2 rounded-lg text-on-primary font-label-lg text-label-lg uppercase tracking-wider transition-colors ${
                botonFacturaDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
              }`}
            >
              {guardandoFactura ? "Guardando..." : "Registrar factura"}
            </button>
          </form>

          <form onSubmit={registrarPago} className="bg-surface-container-lowest rounded-xl p-gap-lg">
            <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">Registrar pago recibido</p>
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
            <div className="grid grid-cols-2 gap-x-gap-md">
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
            <button
              type="submit"
              disabled={botonPagoDeshabilitado}
              className={`px-gap-md py-2 rounded-lg text-on-secondary font-label-lg text-label-lg uppercase tracking-wider transition-colors ${
                botonPagoDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-secondary hover:bg-on-secondary-fixed"
              }`}
            >
              {guardandoPago ? "Registrando..." : "Registrar pago"}
            </button>
          </form>

          <div className="bg-surface-container-lowest rounded-xl p-gap-lg">
            <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-2xs">Métodos de pago</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-gap-md">
              Catálogo de métodos disponibles al registrar un pago (efectivo, transferencia, tarjeta, etc.).
            </p>

            {metodosPago.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-gap-md">Aún no hay métodos de pago registrados.</p>
            ) : (
              <div className="flex flex-col gap-1.5 mb-gap-md">
                {metodosPago.map((m) => (
                  <div key={m.id_metodo} className="flex items-center justify-between gap-gap-sm bg-surface-container-low rounded-lg px-gap-sm py-2 font-body-sm text-body-sm">
                    <span className="normal-case">{m.nombre}</span>
                    <span className="shrink-0">
                      <button onClick={() => abrirEdicionMetodo(m)} className="bg-transparent border-none text-secondary cursor-pointer font-body-sm text-body-sm px-1.5">
                        Editar
                      </button>
                      <button onClick={() => setMetodoAEliminar(m)} className="bg-transparent border-none text-error cursor-pointer font-body-sm text-body-sm px-1.5">
                        Eliminar
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={crearMetodo} className="flex gap-gap-xs">
              <input
                value={nombreMetodoNuevo}
                onChange={(e) => setNombreMetodoNuevo(e.target.value)}
                placeholder="Ej: Pago móvil"
                style={{ ...inputStyle, flex: 1 }}
                required
              />
              <button
                type="submit"
                disabled={botonMetodoDeshabilitado}
                className={`px-gap-sm rounded-lg text-on-secondary font-label-lg text-label-lg uppercase tracking-wider shrink-0 transition-colors ${
                  botonMetodoDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-secondary hover:bg-on-secondary-fixed"
                }`}
              >
                {guardandoMetodoNuevo ? "Agregando..." : "Agregar"}
              </button>
            </form>
          </div>
        </div>

        <div className="flex-1 min-w-[380px]">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            <p className="font-headline-sm text-headline-sm text-on-surface m-0 px-gap-md py-gap-sm border-b border-outline-variant/30">
              Balance por factura ({facturas.length})
            </p>
            {facturas.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant p-gap-lg m-0">
                Aún no hay facturas registradas. Regístralas aquí a medida que se emitan en Facturatech para llevar el balance.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-body-sm text-body-sm">
                  <thead>
                    <tr className="bg-surface-container-low text-left">
                      <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">N° Facturatech</th>
                      <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Empresa</th>
                      <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Fecha</th>
                      <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Total</th>
                      <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Saldo</th>
                      <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturas.map((f) => (
                      <tr key={f.id_factura} className="border-t border-outline-variant/20">
                        <td className="px-gap-sm py-gap-xs">{f.numero_factura_externa || `#${f.id_factura}`}</td>
                        <td className="px-gap-sm py-gap-xs">{f.empresa}</td>
                        <td className="px-gap-sm py-gap-xs">{f.fecha}</td>
                        <td className="px-gap-sm py-gap-xs font-bold text-secondary">${f.total}</td>
                        <td className="px-gap-sm py-gap-xs">${f.saldo_pendiente}</td>
                        <td className="px-gap-sm py-gap-xs">
                          <span className={`font-label-sm text-label-sm font-bold px-gap-xs py-0.5 rounded-full ${ESTADO_COLOR[f.estado]}`}>
                            {ESTADO_LABEL[f.estado]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-xl overflow-hidden mt-gap-lg">
            <p className="font-headline-sm text-headline-sm text-on-surface m-0 px-gap-md py-gap-sm border-b border-outline-variant/30">
              Pagos registrados ({pagos.length})
            </p>
            {pagos.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant p-gap-lg m-0">
                Aún no se ha registrado ningún pago.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-body-sm text-body-sm">
                  <thead>
                    <tr className="bg-surface-container-low text-left">
                      <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Factura</th>
                      <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Fecha</th>
                      <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Monto</th>
                      <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Método de pago</th>
                      <th className="px-gap-sm py-gap-xs"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagos.map((p) => (
                      <tr key={p.id_pago} className="border-t border-outline-variant/20">
                        <td className="px-gap-sm py-gap-xs">{etiquetaFactura(p.id_factura)}</td>
                        <td className="px-gap-sm py-gap-xs">{p.fecha}</td>
                        <td className="px-gap-sm py-gap-xs font-bold text-secondary">${p.monto}</td>
                        <td className="px-gap-sm py-gap-xs">{p.metodo_pago || "—"}</td>
                        <td className="px-gap-sm py-gap-xs whitespace-nowrap">
                          <button onClick={() => abrirEdicionPago(p)} className="bg-transparent border-none text-secondary cursor-pointer font-body-sm text-body-sm px-1.5">
                            Editar
                          </button>
                          <button onClick={() => setPagoAEliminar(p)} className="bg-transparent border-none text-error cursor-pointer font-body-sm text-body-sm px-1.5">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {pagoEditando && (
        <div
          onClick={() => setPagoEditando(null)}
          className="fixed inset-0 z-[1100] bg-on-background/50 flex items-center justify-center p-margin-mobile"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={guardarEdicionPago}
            className="bg-surface-container-lowest rounded-xl p-gap-lg w-full max-w-sm"
          >
            <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">
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
            <div className="flex justify-end gap-gap-xs mt-gap-xs">
              <button
                type="button"
                onClick={() => setPagoEditando(null)}
                className="px-gap-sm py-2 rounded-lg bg-surface-container-high text-on-surface font-label-lg text-label-lg uppercase tracking-wider"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardandoEdicion}
                className={`px-gap-sm py-2 rounded-lg text-on-secondary font-label-lg text-label-lg uppercase tracking-wider ${
                  guardandoEdicion ? "bg-outline-variant cursor-not-allowed" : "bg-secondary hover:bg-on-secondary-fixed"
                }`}
              >
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
          className="fixed inset-0 z-[1100] bg-on-background/50 flex items-center justify-center p-margin-mobile"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={guardarEdicionMetodo}
            className="bg-surface-container-lowest rounded-xl p-gap-lg w-full max-w-sm"
          >
            <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">Editar método de pago</p>
            <Field label="Nombre" required>
              <input value={nombreMetodoEdicion} onChange={(e) => setNombreMetodoEdicion(e.target.value)} style={inputStyle} required />
            </Field>
            <div className="flex justify-end gap-gap-xs mt-gap-xs">
              <button
                type="button"
                onClick={() => setMetodoEditando(null)}
                className="px-gap-sm py-2 rounded-lg bg-surface-container-high text-on-surface font-label-lg text-label-lg uppercase tracking-wider"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardandoMetodoEdicion}
                className={`px-gap-sm py-2 rounded-lg text-on-secondary font-label-lg text-label-lg uppercase tracking-wider ${
                  guardandoMetodoEdicion ? "bg-outline-variant cursor-not-allowed" : "bg-secondary hover:bg-on-secondary-fixed"
                }`}
              >
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
