from fpdf import FPDF

from App.Modulo_Cursos.models.certificado_model import Certificado


def generar_pdf_certificado(certificado: Certificado) -> bytes:
    nombre_completo = " ".join(
        parte for parte in [certificado.usuario.nombre, certificado.usuario.apellido] if parte
    )
    nombre_curso = certificado.curso.nombre_curso if certificado.curso else ""

    pdf = FPDF(orientation="L", unit="mm", format="A4")
    pdf.add_page()

    pdf.set_draw_color(27, 58, 107)  # azul TITAN
    pdf.set_line_width(1.5)
    pdf.rect(8, 8, pdf.w - 16, pdf.h - 16)

    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(192, 22, 28)  # rojo TITAN
    pdf.ln(20)
    pdf.cell(0, 12, "TITAN-ES SEGURIDAD EN ALTURAS SAS", align="C")
    pdf.ln(10)

    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(27, 58, 107)
    pdf.cell(0, 10, "Certificado de Formación en Trabajo Seguro en Alturas", align="C")
    pdf.ln(20)

    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 8, "Se certifica que", align="C")
    pdf.ln(10)

    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 12, nombre_completo, align="C")
    pdf.ln(14)

    pdf.set_font("Helvetica", "", 13)
    pdf.cell(0, 8, f"completó satisfactoriamente el curso de: {nombre_curso}", align="C")
    pdf.ln(16)

    pdf.set_font("Helvetica", "", 11)
    fecha_emision = certificado.fecha_emision.strftime("%d/%m/%Y") if certificado.fecha_emision else "-"
    fecha_vencimiento = certificado.fecha_vencimiento.strftime("%d/%m/%Y") if certificado.fecha_vencimiento else "-"
    pdf.cell(0, 7, f"Código de certificado: {certificado.codigo or certificado.id_certificado}", align="C")
    pdf.ln(7)
    pdf.cell(0, 7, f"Fecha de emisión: {fecha_emision}    |    Vigente hasta: {fecha_vencimiento}", align="C")

    salida = pdf.output()
    return bytes(salida)
