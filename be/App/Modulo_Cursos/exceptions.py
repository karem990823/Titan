import logging
import uuid

from fastapi import Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

logger = logging.getLogger("titan.errors")


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):      
    # JSON mal formado: 400 en vez del 422 de Pydantic, mismo formato del manejador.
    # No se devuelve exc.errors() porque incluiría el cuerpo original que mandó el cliente.
    if any(error["type"] == "json_invalid" for error in exc.errors()):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "mensaje": "Cuerpo de la petición con JSON mal formado",
            },
    )
    # exc.errors() puede incluir el valor original que el usuario mandó (p. ej.
    # un Decimal) dentro de "input"/"ctx" — json.dumps normal (lo que usa
    # JSONResponse por defecto) no sabe serializar eso y tronaba con un 500 en
    # vez del 422 que se buscaba devolver. jsonable_encoder sí sabe.
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder({
            "success": False,
            "message": "Error de validación",
            "data": None,
            "error": "Los datos enviados no son válidos",
            "mensaje": "Error de validación",
            "errores": exc.errors()
        })
    )



async def general_exception_handler(
    request: Request,
    exc: Exception
):
    id_correlacion = uuid.uuid4().hex[:8]
    logger.exception("Error no controlado [%s] en %s %s", id_correlacion, request.method, request.url.path)

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "mensaje": "Error interno del servidor",
            "id_correlacion": id_correlacion
        }
    )