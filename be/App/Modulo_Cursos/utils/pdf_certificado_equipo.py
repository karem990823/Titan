from fpdf import FPDF

from App.Modulo_Cursos.models.certificado_indumentaria_model import CertificadoIndumentaria


def generar_pdf_certificado_equipo(certificado: CertificadoIndumentaria) -> bytes:
    nombre_equipo = certificado.indumentaria.nombre if certificado.indumentaria else ""

    pdf = FPDF(orientation="L", unit="mm", format="A4")
    pdf.add_page()

    pdf.set_draw_color(27, 58, 107)
    pdf.set_line_width(1.5)
    pdf.rect(8, 8, pdf.w - 16, pdf.h - 16)

    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(192, 22, 28)
    pdf.ln(20)
    pdf.cell(0, 12, "TITAN-ES SEGURIDAD EN ALTURAS SAS", align="C")
    pdf.ln(10)

    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(27, 58, 107)
    pdf.cell(0, 10, "Certificado de Aptitud de Equipo", align="C")
    pdf.ln(20)

    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 8, "Se certifica que el equipo", align="C")
    pdf.ln(10)

    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 12, nombre_equipo, align="C")
    pdf.ln(14)

    pdf.set_font("Helvetica", "", 13)
    pdf.cell(0, 8, "fue inspeccionado y se encuentra en estado APTO para su uso", align="C")
    pdf.ln(16)

    pdf.set_font("Helvetica", "", 11)
    fecha_emision = certificado.fecha_emision.strftime("%d/%m/%Y") if certificado.fecha_emision else "-"
    fecha_vencimiento = certificado.fecha_vencimiento.strftime("%d/%m/%Y") if certificado.fecha_vencimiento else "-"
    pdf.cell(0, 7, f"Código de certificado: {certificado.id_certificado_equipo}", align="C")
    pdf.ln(7)
    pdf.cell(0, 7, f"Fecha de emisión: {fecha_emision}    |    Vigente hasta: {fecha_vencimiento}", align="C")

    salida = pdf.output()
    return bytes(salida)
