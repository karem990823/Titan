from typing import Iterable, Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from fastapi import FastAPI
from fastapi.responses import JSONResponse


class ErrorMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "mensaje": "Error interno del servidor",
                    "detalle": str(e),
                },
            )


def register_middlewares(app: FastAPI, allow_origins: Optional[Iterable[str]] = None) -> None:

    if allow_origins is None:
        allow_origins = ["http://localhost:5173"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(allow_origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(ErrorMiddleware)