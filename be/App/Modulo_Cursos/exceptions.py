from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "mensaje": "Error de validación",
            "errores": exc.errors()
        }
    )



async def general_exception_handler(
    request: Request,
    exc: Exception
):

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "mensaje": "Error interno del servidor",
            "detalle": str(exc)
        }
    )