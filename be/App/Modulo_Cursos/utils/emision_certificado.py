import uuid
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from App.Modulo_Cursos.models.asistencia_model import Asistencia
from App.Modulo_Cursos.models.certificado_model import Certificado
from App.Modulo_Cursos.models.evaluacion_model import Evaluacion
from App.Modulo_Cursos.models.inscripcion_model import Inscripcion
from App.Modulo_Cursos.models.programacion_model import ProgramacionCurso

# Regla de negocio (HU10): un participante certifica un curso cuando aprueba
# la evaluación teórica y su asistencia quedó registrada como presente.
# Ambos valores son parámetros del negocio, no del código — se documentan
# aquí porque hoy no existe una tabla de configuración para ellos.
UMBRAL_APROBATORIO = Decimal("70.00")

# La certificación en trabajo en alturas es anual independientemente del tipo
# de curso (Resolución 4272 del Ministerio de Trabajo), igual que en los
# datos sembrados de base/inserts.sql.
VIGENCIA_CERTIFICADO_DIAS = 365


def intentar_emitir_certificado(db: Session, evaluacion: Evaluacion, id_usuario: int, puntaje: Decimal) -> dict:
    """Emite el certificado del curso de `evaluacion` para `id_usuario` si corresponde.

    Devuelve siempre un dict con `emitido: bool`, `codigo: str | None` y
    `motivo: str | None` (motivo solo se llena cuando no se emite), para que
    el llamador pueda mostrar un aviso claro (CA-03 de HU10).
    """
    if evaluacion.id_curso is None:
        return {"emitido": False, "codigo": None, "motivo": "La evaluación no tiene un curso asignado"}

    if puntaje < UMBRAL_APROBATORIO:
        return {"emitido": False, "codigo": None, "motivo": "No alcanzó el puntaje mínimo aprobatorio"}

    asistio = db.query(Asistencia).join(
        Inscripcion, Asistencia.id_inscripcion == Inscripcion.id_inscripcion
    ).join(
        ProgramacionCurso, Inscripcion.id_programacion == ProgramacionCurso.id_programacion
    ).filter(
        Inscripcion.id_usuario == id_usuario,
        ProgramacionCurso.id_curso == evaluacion.id_curso,
        Asistencia.asistio.is_(True),
    ).first()

    if not asistio:
        return {"emitido": False, "codigo": None, "motivo": "Aprobó pero falta asistencia registrada para este curso"}

    existente = db.query(Certificado).filter(
        Certificado.id_usuario == id_usuario,
        Certificado.id_curso == evaluacion.id_curso,
    ).first()
    if existente:
        return {"emitido": True, "codigo": existente.codigo, "motivo": None}

    fecha_emision = date.today()
    nuevo = Certificado(
        codigo=f"CERT-{uuid.uuid4().hex[:10].upper()}",
        fecha_emision=fecha_emision,
        fecha_vencimiento=fecha_emision + timedelta(days=VIGENCIA_CERTIFICADO_DIAS),
        id_usuario=id_usuario,
        id_curso=evaluacion.id_curso,
    )
    db.add(nuevo)
    db.flush()

    return {"emitido": True, "codigo": nuevo.codigo, "motivo": None}
