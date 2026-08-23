import { useState, useEffect } from 'react'
import PageHeader from '../../components/UI/PageHeader'
import Field from '../../components/UI/Field'
import { API_BASE, COLORS, inputStyle } from '../../constants/color'

function InscribirParticipante({ onToast }) {
  const [tiposDoc, setTiposDoc] = useState([])
  const [cursos, setCursos] = useState([])
  const [programaciones, setProgramaciones] = useState([])
  const [participante, setParticipante] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [form, setForm] = useState({
    id_tipo: '', numero_identificacion: '',
    id_curso: '', id_programacion: ''
  })
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/tipos-documento`).then(r => r.json()).then(setTiposDoc)
    fetch(`${API_BASE}/lista-cursos`).then(r => r.json()).then(setCursos)
  }, [])

  useEffect(() => {
    if (!form.id_curso) { setProgramaciones([]); return }
    fetch(`${API_BASE}/programaciones/${form.id_curso}`)
      .then(r => r.json()).then(setProgramaciones)
  }, [form.id_curso])

  const buscarParticipante = async () => {
    if (!form.id_tipo || !form.numero_identificacion) {
      onToast('Selecciona el tipo y número de documento.', 'error'); return
    }
    setBuscando(true)
    setParticipante(null)
    try {
      const res = await fetch(
        `${API_BASE}/participantes/buscar?id_tipo=${form.id_tipo}&numero=${form.numero_identificacion}`
      )
      const data = await res.json()
      if (!res.ok) {
        const msg = typeof data.detail === 'object'
          ? (data.detail.error || data.detail.message)
          : data.detail
        throw new Error(msg || 'Participante no encontrado.')
      }
      setParticipante(data)
    } catch (err) {
      onToast(err.message, 'error')
    } finally {
      setBuscando(false)
    }
  }

  const handleSubmit = async () => {
    if (!participante) { onToast('Primero busca al participante.', 'error'); return }
    if (!form.id_programacion) { onToast('Selecciona una fecha de curso.', 'error'); return }
    setLoading(true)
    setResultado(null)
    try {
      const res = await fetch(`${API_BASE}/${form.id_programacion}/inscribir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: participante.id_usuario })
      })
      const data = await res.json()
      if (!res.ok) {
        const errorMsg = typeof data.detail === 'object'
          ? (data.detail.error || data.detail.message)
          : data.detail
        throw new Error(errorMsg || 'Error en la inscripción')
      }
      setResultado(data.data)
      onToast(data.message || 'Participante inscrito correctamente.', 'success')
      setForm({ id_tipo: '', numero_identificacion: '', id_curso: '', id_programacion: '' })
      setParticipante(null)
      setProgramaciones([])
    } catch (err) {
      onToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Inscribir participante" subtitle="Formaliza la matrícula de un participante en un curso programado." />
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: '28px 32px', flex: '1 1 340px', maxWidth: 520 }}>

          {/* Paso 1 — Buscar participante */}
          <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: '0 0 14px 0', borderBottom: `1px solid ${COLORS.borderGray}`, paddingBottom: 10 }}>
            1. Buscar participante
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Tipo de documento" required>
              <select value={form.id_tipo}
                onChange={e => setForm({ ...form, id_tipo: e.target.value })}
                style={{ ...inputStyle, appearance: 'none' }}>
                <option value="">Seleccionar...</option>
                {tiposDoc.map(t => (
                  <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>
                ))}
              </select>
            </Field>
            <Field label="Número de documento" required>
              <input type="number" placeholder="Ej: 1234567890"
                value={form.numero_identificacion}
                onChange={e => setForm({ ...form, numero_identificacion: e.target.value })}
                style={inputStyle} />
            </Field>
          </div>

          <button onClick={buscarParticipante} disabled={buscando} style={{
            background: COLORS.blue, color: COLORS.white, border: 'none',
            borderRadius: 8, padding: '8px 20px', fontSize: 13,
            fontWeight: 600, cursor: buscando ? 'not-allowed' : 'pointer', marginBottom: 16
          }}>
            {buscando ? 'Buscando...' : 'Buscar participante'}
          </button>

          {participante && (
            <div style={{
              background: COLORS.successBg, border: '1px solid #C0DD97',
              borderRadius: 8, padding: '12px 16px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <span style={{ fontSize: 20 }}>✔</span>
              <div>
                <p style={{ fontWeight: 700, color: COLORS.successText, margin: 0, fontSize: 14 }}>
                  {participante.nombre}
                </p>
                <p style={{ color: '#3B6D11', margin: 0, fontSize: 12 }}>
                  {participante.tipo_documento} · {participante.numero_identificacion}
                </p>
              </div>
            </div>
          )}

          {/* Paso 2 — Seleccionar curso y fecha */}
          <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: '0 0 14px 0', borderBottom: `1px solid ${COLORS.borderGray}`, paddingBottom: 10 }}>
            2. Seleccionar curso y fecha
          </p>

          <Field label="Tipo de curso" required>
            <select value={form.id_curso}
              onChange={e => setForm({ ...form, id_curso: e.target.value, id_programacion: '' })}
              style={{ ...inputStyle, appearance: 'none' }}>
              <option value="">Seleccionar curso...</option>
              {cursos.map(c => (
                <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>
              ))}
            </select>
          </Field>

          {programaciones.length > 0 && (
            <Field label="Fecha y horario disponible" required>
              <select value={form.id_programacion}
                onChange={e => setForm({ ...form, id_programacion: e.target.value })}
                style={{ ...inputStyle, appearance: 'none' }}>
                <option value="">Seleccionar fecha...</option>
                {programaciones.map(p => (
                  <option key={p.id_programacion} value={p.id_programacion}>
                    {p.fecha} · {p.hora} · {p.cupos} cupos disponibles
                  </option>
                ))}
              </select>
            </Field>
          )}

          {form.id_curso && programaciones.length === 0 && (
            <p style={{
              fontSize: 13, color: COLORS.warningText, background: COLORS.warningBg,
              padding: '10px 14px', borderRadius: 8, margin: '0 0 16px 0'
            }}>
              ⚠ No hay fechas con cupos disponibles para este curso.
            </p>
          )}

          <div style={{ borderTop: `1px solid ${COLORS.borderGray}`, paddingTop: 20, marginTop: 8 }}>
            <button
              onClick={handleSubmit}
              disabled={loading || !participante || !form.id_programacion}
              style={{
                background: loading || !participante || !form.id_programacion ? '#ccc' : COLORS.red,
                color: COLORS.white, border: 'none', borderRadius: 8,
                padding: '10px 28px', fontSize: 14, fontWeight: 600,
                cursor: loading || !participante || !form.id_programacion ? 'not-allowed' : 'pointer'
              }}>
              {loading ? 'Inscribiendo...' : 'Inscribir participante'}
            </button>
          </div>
        </div>

        {/* Resultado inscripción */}
        {resultado && (
          <div style={{ background: COLORS.successBg, border: '1px solid #C0DD97', borderRadius: 12, padding: '24px 28px', flex: '0 0 200px' }}>
            <p style={{ fontWeight: 700, color: COLORS.successText, margin: '0 0 16px 0', fontSize: 15 }}>✔ Inscripción exitosa</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, color: '#639922', margin: '0 0 2px 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Estado</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.successText, margin: 0, textTransform: 'capitalize' }}>
                  {resultado.estado}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#639922', margin: '0 0 2px 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Cupos restantes</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: COLORS.successText, margin: 0 }}>
                  {resultado.cupos_restantes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InscribirParticipante