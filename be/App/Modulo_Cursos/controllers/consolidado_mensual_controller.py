from sqlalchemy import extract
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.certificado_model import Certificado
from App.Modulo_Cursos.models.consolidado_mensual_model import ConsolidadoMensual, ConsolidadoParticipante
from App.Modulo_Cursos.models.evaluacion_presentada_model import EvaluacionPresentada
from App.Modulo_Cursos.models.resultado_model import Resultado
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.emision_certificado import UMBRAL_APROBATORIO
from App.Modulo_Cursos.utils.response import api_response


def _serializar_participante(p: ConsolidadoParticipante) -> dict:
    return {
        "id_usuario": p.id_usuario,
        "trabajador": f"{p.trabajador.nombre} {p.trabajador.apellido or ''}".strip() if p.trabajador else None,
        "id_curso": p.id_curso,
        "curso": p.curso.nombre_curso if p.curso else None,
        "incluido": p.incluido,
        "motivo_exclusion": p.motivo_exclusion,
    }


def ejecutar_cierre_mes(db: Session, mes: int, anio: int, current_user: Usuario) -> dict:
    aprobados = db.query(EvaluacionPresentada).options(
        joinedload(EvaluacionPresentada.resultado),
        joinedload(EvaluacionPresentada.evaluacion),
    ).join(Resultado).filter(
        extract("month", EvaluacionPresentada.fecha) == mes,
        extract("year", EvaluacionPresentada.fecha) == anio,
        Resultado.puntaje >= UMBRAL_APROBATORIO,
    ).all()

    # Un mismo usuario puede haber presentado varias evaluaciones del mismo curso;
    # se consolida una sola fila por (usuario, curso).
    vistos: set[tuple[int, int]] = set()
    filas: list[ConsolidadoParticipante] = []

    for presentada in aprobados:
        id_curso = presentada.evaluacion.id_curso if presentada.evaluacion else None
        if id_curso is None:
            continue

        clave = (presentada.id_usuario, id_curso)
        if clave in vistos:
            continue
        vistos.add(clave)

        tiene_certificado = db.query(Certificado).filter(
            Certificado.id_usuario == presentada.id_usuario,
            Certificado.id_curso == id_curso,
        ).first() is not None

        filas.append(ConsolidadoParticipante(
            id_usuario=presentada.id_usuario,
            id_curso=id_curso,
            incluido=tiene_certificado,
            motivo_exclusion=None if tiene_certificado else "Aprobó pero no tiene certificado emitido para este curso (verificar asistencia)",
        ))

    consolidado = ConsolidadoMensual(mes=mes, anio=anio, generado_por=current_user.id_usuario)
    consolidado.participantes = filas
    db.add(consolidado)
    db.commit()
    db.refresh(consolidado)

    for fila in consolidado.participantes:
        db.refresh(fila)

    incluidos = [f for f in consolidado.participantes if f.incluido]
    excluidos = [f for f in consolidado.participantes if not f.incluido]

    return api_response(
        success=True,
        message=f"Cierre de {mes:02d}/{anio} ejecutado: {len(incluidos)} incluidos, {len(excluidos)} excluidos",
        data={
            "id_consolidado": consolidado.id_consolidado,
            "incluidos": [_serializar_participante(f) for f in incluidos],
            "excluidos": [_serializar_participante(f) for f in excluidos],
        }
    )


def listar_consolidados(db: Session) -> dict:
    items = db.query(ConsolidadoMensual).options(
        joinedload(ConsolidadoMensual.participantes)
    ).order_by(ConsolidadoMensual.fecha_creacion.desc()).all()

    return api_response(
        success=True,
        message="Consolidados obtenidos correctamente",
        data=[{
            "id_consolidado": c.id_consolidado,
            "mes": c.mes,
            "anio": c.anio,
            "fecha_creacion": c.fecha_creacion.strftime("%Y-%m-%d %H:%M") if c.fecha_creacion else None,
            "total_incluidos": sum(1 for p in c.participantes if p.incluido),
            "total_excluidos": sum(1 for p in c.participantes if not p.incluido),
        } for c in items]
    )
