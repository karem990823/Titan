import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_FACTURAS, API_METODOS_PAGO, API_PAGOS, API_USUARIOS, COLORS, inputStyle } from "../../constants/color";
import type { ApiResponse, EstadoFactura, FacturaResumen, MetodoPago, ToastType, UsuarioAdmin } from "../../types";

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

  useEffect(() => {
    cargarFacturas();
    apiFetch<ApiResponse<UsuarioAdmin[]>>(`${API_USUARIOS}/?tipo_registro=empresa`).then((res) => setEmpresas(res.data)).catch(() => {});
    apiFetch<ApiResponse<MetodoPago[]>>(`${API_METODOS_PAGO}/`).then((res) => setMetodosPago(res.data)).catch(() => setMetodosPago([]));
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
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardandoPago(false);
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
        </div>
      </div>
    </div>
  );
}

export default Facturacion;
