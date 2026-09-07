import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.config import settings
from App.Modulo_Cursos.models.password_reset_token_model import PasswordResetToken

EXPIRACION_MINUTOS = 30


def _hash_token(token_plano: str) -> str:
    return hashlib.sha256(token_plano.encode("utf-8")).hexdigest()


def generar_enlace_password(db: Session, id_usuario: int) -> str:
    token_plano = secrets.token_urlsafe(32)

    registro = PasswordResetToken(
        id_usuario=id_usuario,
        token_hash=_hash_token(token_plano),
        fecha_expiracion=datetime.now(timezone.utc) + timedelta(minutes=EXPIRACION_MINUTOS),
    )
    db.add(registro)
    db.commit()

    return f"{settings.FRONTEND_URL}/crear-password?token={token_plano}"


def consumir_token(db: Session, token_plano: str) -> PasswordResetToken | None:
    registro = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == _hash_token(token_plano),
        PasswordResetToken.usado.is_(False),
    ).first()

    if not registro:
        return None

    expiracion = registro.fecha_expiracion
    if expiracion.tzinfo is None:
        expiracion = expiracion.replace(tzinfo=timezone.utc)

    if expiracion < datetime.now(timezone.utc):
        return None

    return registro
