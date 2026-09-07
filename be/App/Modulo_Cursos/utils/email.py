import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from App.Modulo_Cursos.config.config import settings

logger = logging.getLogger("titan.email")


def enviar_correo(destinatario: str, asunto: str, cuerpo_html: str) -> bool:
    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = asunto
    mensaje["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    mensaje["To"] = destinatario
    mensaje.attach(MIMEText(cuerpo_html, "html", "utf-8"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as servidor:
            servidor.starttls()
            servidor.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            servidor.sendmail(settings.SMTP_USER, [destinatario], mensaje.as_string())
        return True
    except Exception:
        # No se propaga: si el correo falla, la cuenta/token ya quedó creado
        # en la base de datos y el flujo que llamó a esta función no debe
        # romperse por un problema transitorio del proveedor de correo.
        logger.exception("No se pudo enviar el correo a %s", destinatario)
        return False


def _plantilla_base(titulo: str, mensaje_html: str, enlace: str, texto_boton: str) -> str:
    return f"""
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8f9ff;">
      <p style="font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #93000b; font-weight: bold; margin: 0 0 8px;">
        TITAN-ES Seguridad en Alturas
      </p>
      <h1 style="font-size: 20px; color: #0d1c2f; margin: 0 0 16px;">{titulo}</h1>
      <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 24px;">{mensaje_html}</p>
      <a href="{enlace}" style="display: inline-block; background: #93000b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px;">
        {texto_boton}
      </a>
      <p style="font-size: 12px; color: #888; margin: 24px 0 0;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
        <a href="{enlace}" style="color: #476080;">{enlace}</a>
      </p>
      <p style="font-size: 12px; color: #888; margin: 16px 0 0;">
        Este enlace expira en 30 minutos. Si no solicitaste esto, puedes ignorar este correo.
      </p>
    </div>
    """


def enviar_correo_crear_password(destinatario: str, nombre: str, enlace: str) -> bool:
    cuerpo = _plantilla_base(
        titulo=f"Hola {nombre}, activa tu cuenta",
        mensaje_html="Se creó una cuenta para ti en el sistema de TITAN-ES. Para poder iniciar sesión, primero necesitas crear tu contraseña.",
        enlace=enlace,
        texto_boton="Crear mi contraseña",
    )
    return enviar_correo(destinatario, "Activa tu cuenta en TITAN-ES", cuerpo)


def enviar_correo_restablecer_password(destinatario: str, nombre: str, enlace: str) -> bool:
    cuerpo = _plantilla_base(
        titulo=f"Hola {nombre}, restablece tu contraseña",
        mensaje_html="Recibimos una solicitud para restablecer la contraseña de tu cuenta en TITAN-ES. Si fuiste tú, haz clic en el siguiente botón.",
        enlace=enlace,
        texto_boton="Restablecer contraseña",
    )
    return enviar_correo(destinatario, "Restablece tu contraseña en TITAN-ES", cuerpo)


def enviar_correo_alertas(destinatario: str, vencimientos: list[dict], facturas: list[dict]) -> bool:
    def _fila(mensaje: str) -> str:
        return f'<li style="margin-bottom: 8px; color: #444;">{mensaje}</li>'

    seccion_vencimientos = (
        "".join(_fila(v["mensaje"]) for v in vencimientos)
        if vencimientos else
        '<li style="color: #888;">Ninguno.</li>'
    )
    seccion_facturas = (
        "".join(_fila(f["mensaje"]) for f in facturas)
        if facturas else
        '<li style="color: #888;">Ninguna.</li>'
    )

    cuerpo = f"""
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #f8f9ff;">
      <p style="font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #93000b; font-weight: bold; margin: 0 0 8px;">
        TITAN-ES Seguridad en Alturas
      </p>
      <h1 style="font-size: 20px; color: #0d1c2f; margin: 0 0 20px;">Alertas del sistema</h1>

      <h2 style="font-size: 15px; color: #476080; margin: 0 0 8px;">
        Certificados próximos a vencer ({len(vencimientos)})
      </h2>
      <ul style="font-size: 13px; padding-left: 20px; margin: 0 0 24px;">{seccion_vencimientos}</ul>

      <h2 style="font-size: 15px; color: #476080; margin: 0 0 8px;">
        Facturas pendientes de pago ({len(facturas)})
      </h2>
      <ul style="font-size: 13px; padding-left: 20px; margin: 0;">{seccion_facturas}</ul>
    </div>
    """
    return enviar_correo(destinatario, "Alertas de TITAN-ES", cuerpo)
