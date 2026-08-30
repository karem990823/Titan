from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.controllers.auth_controller import get_me, login
from App.Modulo_Cursos.deps import get_current_user
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.schemas.auth_schema import LoginRequest

router = APIRouter(
    prefix="/api/auth",
    tags=["Autenticación"]
)


@router.post("/login")
def iniciar_sesion(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "desconocida"
    return login(db, data, ip)


@router.get("/me")
def usuario_actual(current_user: Usuario = Depends(get_current_user)):
    return get_me(current_user)
