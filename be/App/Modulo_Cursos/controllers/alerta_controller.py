from datetime import date, timedelta

from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.controllers.factura_controller import _calcular_saldo
from App.Modulo_Cursos.models.alerta_model import Alerta
from App.Modulo_Cursos.models.certificado_model import Certificado
from App.Modulo_Cursos.models.factura_model import Factura
from App.Modulo_Cursos.models.rol_model import Rol
from App.Modulo_Cursos.models.tipo_alerta_model import TipoAlerta
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.email import enviar_correo_alertas
from App.Modulo_Cursos.utils.response import api_response

DIAS_ANTICIPACION_VENCIMIENTO = 30

NOMBRE_TIPO_VENCIMIENTO = "Vencimiento de certificado"
NOMBRE_TIPO_FACTURA = "Factura pendiente de pago"


def _obtener_o_crear_tipo(db: Session, nombre: str) -> TipoAlerta:
    tipo = db.query(TipoAlerta).filter(TipoAlerta.nombre == nombre).first()
    if not tipo:
        tipo = TipoAlerta(nombre=nombre)
        db.add(tipo)
        db.commit()
        db.refresh(tipo)
    return tipo


def _ya_existe_alerta(db: Session, id_tipo_alerta: int, id_referencia: int) -> bool:
    return db.query(Alerta).filter(
        Alerta.id_tipo_alerta == id_tipo_alerta,
        Alerta.id_referencia == id_referencia,
    ).first() is not None


def _serializar(a: Alerta) -> dict:
    return {
        "id_alerta": a.id_alerta,
        "tipo": a.tipo_alerta.nombre if a.tipo_alerta else None,
        "mensaje": a.mensaje,
        "fecha_vencimiento": a.fecha_vencimiento.strftime("%Y-%m-%d") if a.fecha_vencimiento else None,
        "estado": a.estado,
        "fecha_creacion": a.fecha_creacion.strftime("%Y-%m-%d %H:%M") if a.fecha_creacion else None,
    }


def _detectar_vencimientos(db: Session, tipo: TipoAlerta) -> list[Alerta]:
    hoy = date.today()
    limite = hoy + timedelta(days=DIAS_ANTICIPACION_VENCIMIENTO)

    certificados = db.query(Certificado).options(
        joinedload(Certificado.usuario), joinedload(Certificado.curso)
    ).filter(
        Certificado.fecha_vencimiento >= hoy,
        Certificado.fecha_vencimiento <= limite,
    ).all()

    nuevas = []
    for cert in certificados:
        if _ya_existe_alerta(db, tipo.id_tipo_alerta, cert.id_certificado):
            continue
        trabajador = cert.usuario.nombre if cert.usuario else "un trabajador"
        if cert.usuario and cert.usuario.apellido:
            trabajador = f"{trabajador} {cert.usuario.apellido}"
        curso_nombre = cert.curso.nombre_curso if cert.curso else "un curso"
        mensaje = (
            f"El certificado de {trabajador} para el curso \"{curso_nombre}\" "
            f"vence el {cert.fecha_vencimiento.strftime('%d/%m/%Y')}."
        )
        nuevas.append(Alerta(
            id_tipo_alerta=tipo.id_tipo_alerta,
            id_referencia=cert.id_certificado,
            mensaje=mensaje,
            fecha_vencimiento=cert.fecha_vencimiento,
            estado="pendiente",
            id_usuario=cert.id_usuario,
        ))
    return nuevas


def _detectar_facturas_pendientes(db: Session, tipo: TipoAlerta) -> list[Alerta]:
    facturas = db.query(Factura).options(
        joinedload(Factura.detalles), joinedload(Factura.pagos), joinedload(Factura.empresa)
    ).all()

    nuevas = []
    for factura in facturas:
        saldo = _calcular_saldo(factura)
        if saldo <= 0:
            continue
        if _ya_existe_alerta(db, tipo.id_tipo_alerta, factura.id_factura):
            continue
        empresa_nombre = factura.empresa.nombre if factura.empresa else "una empresa"
        numero = factura.numero_factura_externa or f"#{factura.id_factura}"
        mensaje = (
            f"La factura {numero} de {empresa_nombre} tiene un saldo pendiente de ${saldo}."
        )
        nuevas.append(Alerta(
            id_tipo_alerta=tipo.id_tipo_alerta,
            id_referencia=factura.id_factura,
            mensaje=mensaje,
            fecha_vencimiento=factura.fecha,
            estado="pendiente",
            id_usuario=factura.id_empresa,
        ))
    return nuevas


def generar_alertas(db: Session) -> dict:
    tipo_vencimiento = _obtener_o_crear_tipo(db, NOMBRE_TIPO_VENCIMIENTO)
    tipo_factura = _obtener_o_crear_tipo(db, NOMBRE_TIPO_FACTURA)

    nuevas_vencimiento = _detectar_vencimientos(db, tipo_vencimiento)
    nuevas_factura = _detectar_facturas_pendientes(db, tipo_factura)
    nuevas = nuevas_vencimiento + nuevas_factura

    for alerta in nuevas:
        db.add(alerta)
    db.commit()

    pendientes = db.query(Alerta).filter(Alerta.estado == "pendiente").all()
    pendientes_vencimiento = [a for a in pendientes if a.id_tipo_alerta == tipo_vencimiento.id_tipo_alerta]
    pendientes_factura = [a for a in pendientes if a.id_tipo_alerta == tipo_factura.id_tipo_alerta]

    correo_enviado = False
    if pendientes:
        administradores = db.query(Usuario).join(Rol).filter(
            Rol.nombre_rol == "Administrador",
            Usuario.estado_activo == True,
            Usuario.correo.isnot(None),
        ).all()

        datos_vencimiento = [{"mensaje": a.mensaje} for a in pendientes_vencimiento]
        datos_factura = [{"mensaje": a.mensaje} for a in pendientes_factura]

        for admin in administradores:
            if enviar_correo_alertas(admin.correo, datos_vencimiento, datos_factura):
                correo_enviado = True

        if correo_enviado:
            for a in pendientes:
                a.estado = "enviada"
            db.commit()

    return api_response(
        success=True,
        message=f"Se detectaron {len(nuevas)} alertas nuevas ({len(nuevas_vencimiento)} vencimientos, {len(nuevas_factura)} facturas).",
        data={
            "nuevas_vencimiento": len(nuevas_vencimiento),
            "nuevas_factura": len(nuevas_factura),
            "correo_enviado": correo_enviado,
        }
    )


def listar_alertas(db: Session) -> dict:
    alertas = db.query(Alerta).options(joinedload(Alerta.tipo_alerta)).order_by(
        Alerta.fecha_creacion.desc()
    ).all()

    return api_response(
        success=True,
        message="Alertas obtenidas correctamente",
        data=[_serializar(a) for a in alertas]
    )
