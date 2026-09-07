from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.rol_model import Rol
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.email import enviar_correo_crear_password
from App.Modulo_Cursos.utils.password_reset import generar_enlace_password
from App.Modulo_Cursos.utils.response import api_response
from App.Modulo_Cursos.utils.security import hash_password


def _serializar(usuario: Usuario) -> dict:
    return {
        "id_usuario": usuario.id_usuario,
        "tipo_registro": usuario.tipo_registro,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "correo": usuario.correo,
        "id_rol": usuario.id_rol,
        "rol_nombre": usuario.rol.nombre_rol if usuario.rol else None,
        "id_empresa": usuario.id_empresa,
        "estado_activo": usuario.estado_activo,
    }


def _serializar_trabajador(usuario: Usuario) -> dict:
    return {
        "id_usuario": usuario.id_usuario,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "numero_identificacion": usuario.numero_identificacion,
        "tipo_documento": usuario.tipo_documento.nombre if usuario.tipo_documento else None,
        "direccion": usuario.direccion,
        "telefono": usuario.telefono,
    }


def _obtener_o_404(db: Session, id_usuario: int) -> Usuario:
    usuario = db.query(Usuario).options(
        joinedload(Usuario.rol)
    ).filter(Usuario.id_usuario == id_usuario).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Usuario no encontrado",
                error="No existe un usuario con ese ID"
            )
        )
    return usuario


def _validar_correo_disponible(db: Session, correo: str, id_usuario_actual: int | None = None):
    query = db.query(Usuario).filter(Usuario.correo == correo)
    if id_usuario_actual is not None:
        query = query.filter(Usuario.id_usuario != id_usuario_actual)

    if query.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo guardar el usuario",
                error="Ya existe un usuario registrado con ese correo"
            )
        )


def _validar_rol_existe(db: Session, id_rol: int):
    if not db.query(Rol).filter(Rol.id_rol == id_rol).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo guardar el usuario",
                error="El rol indicado no existe"
            )
        )


# --- Gestión de cuentas (Administrador) ---

def crear_usuario(db: Session, data) -> dict:
    _validar_correo_disponible(db, data.correo)
    _validar_rol_existe(db, data.id_rol)

    # Sin password_hash todavía: el administrador nunca define la contraseña
    # de otra persona. Se le envía un enlace de un solo uso para que la cree
    # ella misma; hasta entonces la cuenta no puede iniciar sesión (login
    # rechaza password_hash nulo).
    nuevo = Usuario(**data.model_dump())

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    enlace = generar_enlace_password(db, nuevo.id_usuario)
    correo_enviado = enviar_correo_crear_password(nuevo.correo, nuevo.nombre, enlace)

    return api_response(
        success=True,
        message=(
            "Usuario creado correctamente. Se le envió un correo para crear su contraseña."
            if correo_enviado else
            "Usuario creado correctamente, pero no se pudo enviar el correo de activación. Usa 'olvidé mi contraseña' para reintentar."
        ),
        data=_serializar(nuevo)
    )


def listar_usuarios(db: Session, tipo_registro: str | None = None, id_rol: int | None = None) -> dict:
    query = db.query(Usuario).options(joinedload(Usuario.rol))

    if tipo_registro:
        query = query.filter(Usuario.tipo_registro == tipo_registro)
    else:
        # Sin filtro explícito, esta es la lista de "Usuarios" del administrador
        # (gestión de cuentas) — los trabajadores nunca tienen contraseña ni
        # acceso al sistema, así que no pertenecen aquí. Quien sí los necesita
        # los pide explícitamente con tipo_registro="trabajador" o vía los
        # endpoints dedicados de trabajadores.
        query = query.filter(Usuario.tipo_registro != "trabajador")
    if id_rol:
        query = query.filter(Usuario.id_rol == id_rol)

    usuarios = query.order_by(Usuario.id_usuario).all()

    return api_response(
        success=True,
        message="Usuarios obtenidos correctamente",
        data=[_serializar(u) for u in usuarios]
    )


def actualizar_usuario(db: Session, id_usuario: int, data) -> dict:
    usuario = _obtener_o_404(db, id_usuario)
    cambios = data.model_dump(exclude_unset=True, exclude={"password"})

    if "correo" in cambios:
        _validar_correo_disponible(db, cambios["correo"], id_usuario_actual=id_usuario)
    if "id_rol" in cambios:
        _validar_rol_existe(db, cambios["id_rol"])

    for campo, valor in cambios.items():
        setattr(usuario, campo, valor)

    if data.password:
        usuario.password_hash = hash_password(data.password)

    db.commit()
    db.refresh(usuario)

    return api_response(
        success=True,
        message="Usuario actualizado correctamente",
        data=_serializar(usuario)
    )


def desactivar_usuario(db: Session, id_usuario: int) -> dict:
    usuario = _obtener_o_404(db, id_usuario)
    usuario.estado_activo = False

    db.commit()
    db.refresh(usuario)

    return api_response(
        success=True,
        message="Usuario desactivado correctamente",
        data=_serializar(usuario)
    )


# --- Registro de trabajadores (Empresa sobre sí misma, o Administrador sobre cualquier empresa) ---

def _validar_empresa_existe(db: Session, id_empresa: int) -> Usuario:
    empresa = db.query(Usuario).filter(
        Usuario.id_usuario == id_empresa,
        Usuario.tipo_registro == "empresa",
    ).first()
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo registrar el trabajador",
                error="La empresa indicada no existe"
            )
        )
    return empresa


def _crear_trabajador(db: Session, data, id_empresa: int) -> dict:
    rol_participante = db.query(Rol).filter(Rol.nombre_rol == "Participante").first()

    nuevo = Usuario(
        tipo_registro="trabajador",
        id_rol=rol_participante.id_rol if rol_participante else None,
        id_empresa=id_empresa,
        password_hash=None,
        **data.model_dump(),
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return api_response(
        success=True,
        message="Trabajador registrado correctamente",
        data=_serializar_trabajador(nuevo)
    )


def _listar_trabajadores(db: Session, id_empresa: int) -> dict:
    trabajadores = db.query(Usuario).options(
        joinedload(Usuario.tipo_documento)
    ).filter(
        Usuario.id_empresa == id_empresa,
        Usuario.tipo_registro == "trabajador",
    ).order_by(Usuario.nombre).all()

    return api_response(
        success=True,
        message="Trabajadores obtenidos correctamente",
        data=[_serializar_trabajador(t) for t in trabajadores]
    )


def crear_trabajador_propio(db: Session, data, empresa_actual: Usuario) -> dict:
    return _crear_trabajador(db, data, empresa_actual.id_usuario)


def listar_trabajadores_propios(db: Session, empresa_actual: Usuario) -> dict:
    return _listar_trabajadores(db, empresa_actual.id_usuario)


def crear_trabajador_admin(db: Session, data, id_empresa: int) -> dict:
    _validar_empresa_existe(db, id_empresa)
    return _crear_trabajador(db, data, id_empresa)


def listar_trabajadores_admin(db: Session, id_empresa: int) -> dict:
    _validar_empresa_existe(db, id_empresa)
    return _listar_trabajadores(db, id_empresa)


def listar_todos_los_trabajadores(db: Session) -> dict:
    trabajadores = db.query(Usuario).options(
        joinedload(Usuario.tipo_documento)
    ).filter(Usuario.tipo_registro == "trabajador").order_by(Usuario.nombre).all()

    # id_empresa es una clave foránea autoreferenciada a usuarios sin
    # relationship() declarada en el modelo; se resuelve con una sola
    # consulta adicional en vez de repetirla por cada trabajador (N+1).
    ids_empresa = {t.id_empresa for t in trabajadores if t.id_empresa}
    nombres_empresa = {
        e.id_usuario: e.nombre
        for e in db.query(Usuario).filter(Usuario.id_usuario.in_(ids_empresa)).all()
    } if ids_empresa else {}

    data = []
    for t in trabajadores:
        item = _serializar_trabajador(t)
        item["id_empresa"] = t.id_empresa
        item["empresa"] = nombres_empresa.get(t.id_empresa)
        data.append(item)

    return api_response(
        success=True,
        message="Trabajadores obtenidos correctamente",
        data=data
    )


# --- Consulta usada por el módulo académico ---

def listar_instructores(db: Session) -> list[dict]:
    instructores = db.query(Usuario).options(
        joinedload(Usuario.tipo_documento)
    ).join(Rol).filter(
        Rol.nombre_rol == "Instructor",
        Usuario.estado_activo == True,
    ).all()

    return [{
        "id_usuario": i.id_usuario,
        "nombre": f"{i.nombre} {i.apellido}",
        "tipo_documento": i.tipo_documento.nombre if i.tipo_documento else "",
        "numero_identificacion": i.numero_identificacion
    } for i in instructores]
