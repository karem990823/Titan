from datetime import date

from fastapi import HTTPException, Response, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.certificado_model import Certificado
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.pdf_certificado import generar_pdf_certificado
from App.Modulo_Cursos.utils.response import api_response


def _certificado_no_encontrado() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=api_response(
            success=False,
            message="Certificado no encontrado",
            error="No existe un certificado con esos datos"
        )
    )


def _serializar(cert: Certificado) -> dict:
    return {
        "id_certificado": cert.id_certificado,
        "codigo": cert.codigo,
        "fecha_emision": cert.fecha_emision,
        "fecha_vencimiento": cert.fecha_vencimiento,
        "id_usuario": cert.id_usuario,
        "id_curso": cert.id_curso,
        "curso_nombre": cert.curso.nombre_curso if cert.curso else None,
    }


def _serializar_publico(cert: Certificado) -> dict:
    nombre_completo = " ".join(
        parte for parte in [cert.usuario.nombre, cert.usuario.apellido] if parte
    ) if cert.usuario else None

    return {
        "id_certificado": cert.id_certificado,
        "nombre_completo": nombre_completo,
        "curso_nombre": cert.curso.nombre_curso if cert.curso else None,
        "codigo": cert.codigo,
        "fecha_emision": cert.fecha_emision,
        "fecha_vencimiento": cert.fecha_vencimiento,
        "vigente": bool(cert.fecha_vencimiento and cert.fecha_vencimiento >= date.today()),
    }


def _query_certificados(db: Session):
    return db.query(Certificado).options(
        joinedload(Certificado.usuario),
        joinedload(Certificado.curso),
    )


def listar_certificados(db: Session) -> dict:
    certificados = _query_certificados(db).all()
    return api_response(
        success=True,
        message="Certificados obtenidos correctamente",
        data=[_serializar(c) for c in certificados]
    )


# --- Consulta pública (sin autenticación) ---

def buscar_publico(db: Session, id_tipo: int, numero_identificacion: int) -> dict:
    certificados = _query_certificados(db).join(Usuario).filter(
        Usuario.id_tipo == id_tipo,
        Usuario.numero_identificacion == numero_identificacion,
        Usuario.tipo_registro == "trabajador",
    ).all()

    return api_response(
        success=True,
        message="Consulta realizada correctamente",
        data=[_serializar_publico(c) for c in certificados]
    )


def descargar_publico(db: Session, id_certificado: int, id_tipo: int, numero_identificacion: int) -> Response:
    certificado = _query_certificados(db).filter(
        Certificado.id_certificado == id_certificado
    ).first()

    if (
        not certificado
        or not certificado.usuario
        or certificado.usuario.id_tipo != id_tipo
        or certificado.usuario.numero_identificacion != numero_identificacion
    ):
        # Mismo error tanto si el certificado no existe como si el tipo+número
        # no coinciden con su dueño: evita que alguien confirme por fuerza
        # bruta la existencia de un id_certificado ajeno.
        raise _certificado_no_encontrado()

    pdf_bytes = generar_pdf_certificado(certificado)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="certificado-{certificado.codigo or certificado.id_certificado}.pdf"'
        }
    )


# --- Empresa: certificados de sus propios trabajadores ---

def listar_mis_trabajadores(db: Session, empresa_actual: Usuario) -> dict:
    certificados = _query_certificados(db).join(Usuario).filter(
        Usuario.id_empresa == empresa_actual.id_usuario
    ).all()

    return api_response(
        success=True,
        message="Certificados obtenidos correctamente",
        data=[_serializar(c) for c in certificados]
    )


def descargar_certificado(db: Session, id_certificado: int, current_user: Usuario) -> Response:
    certificado = _query_certificados(db).filter(
        Certificado.id_certificado == id_certificado
    ).first()

    if not certificado:
        raise _certificado_no_encontrado()

    rol_actual = current_user.rol.nombre_rol if current_user.rol else None
    if rol_actual == "Empresa":
        if not certificado.usuario or certificado.usuario.id_empresa != current_user.id_usuario:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=api_response(
                    success=False,
                    message="Acceso denegado",
                    error="Este certificado no pertenece a un trabajador de tu empresa"
                )
            )

    pdf_bytes = generar_pdf_certificado(certificado)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="certificado-{certificado.codigo or certificado.id_certificado}.pdf"'
        }
    )
