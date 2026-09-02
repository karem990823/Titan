import json

from fpdf import FPDF

from App.Modulo_Cursos.models.reporte_model import Reporte

AZUL_TITAN = (27, 58, 107)
ROJO_TITAN = (192, 22, 28)
GRIS_TEXTO = (60, 60, 60)
GRIS_CLARO = (240, 240, 240)


def _seccion(pdf: FPDF, titulo: str):
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(*AZUL_TITAN)
    pdf.ln(6)
    pdf.cell(0, 9, titulo)
    pdf.ln(9)
    pdf.set_draw_color(*AZUL_TITAN)
    pdf.set_line_width(0.3)
    pdf.line(pdf.get_x(), pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
    pdf.ln(4)


def _fila_vacia(pdf: FPDF, texto: str):
    pdf.set_font("Helvetica", "I", 10)
    pdf.set_text_color(130, 130, 130)
    pdf.cell(0, 6, texto)
    pdf.ln(6)


def generar_pdf_reporte_diario(reporte: Reporte) -> bytes:
    contenido = json.loads(reporte.contenido_json or "{}")
    cursos = contenido.get("cursos_programados", [])
    asistencias = contenido.get("asistencias_marcadas", 0)
    incidentes = contenido.get("incidentes_registrados", [])
    certificados = contenido.get("certificados_emitidos", [])

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(*ROJO_TITAN)
    pdf.cell(0, 10, "TITAN-ES SEGURIDAD EN ALTURAS SAS")
    pdf.ln(9)

    pdf.set_font("Helvetica", "", 13)
    pdf.set_text_color(*AZUL_TITAN)
    fecha = reporte.fecha.strftime("%d/%m/%Y") if reporte.fecha else "-"
    pdf.cell(0, 8, f"Reporte diario de actividad - {fecha}")
    pdf.ln(10)

    pdf.set_draw_color(*ROJO_TITAN)
    pdf.set_line_width(0.8)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
    pdf.ln(4)

    # Cursos programados
    _seccion(pdf, f"Cursos programados ({len(cursos)})")
    if not cursos:
        _fila_vacia(pdf, "No hubo cursos programados este día.")
    else:
        pdf.set_font("Helvetica", "", 11)
        pdf.set_text_color(*GRIS_TEXTO)
        for c in cursos:
            hora = c.get("hora") or "-"
            curso_nombre = c.get("curso") or "Curso sin nombre"
            pdf.cell(0, 7, f"-  {hora}   {curso_nombre}")
            pdf.ln(6)

    # Asistencias
    _seccion(pdf, "Asistencias marcadas")
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(*AZUL_TITAN)
    pdf.cell(0, 12, str(asistencias))
    pdf.ln(12)

    # Incidentes
    _seccion(pdf, f"Incidentes registrados ({len(incidentes)})")
    if not incidentes:
        _fila_vacia(pdf, "Sin incidentes registrados este día.")
    else:
        pdf.set_font("Helvetica", "", 11)
        pdf.set_text_color(*GRIS_TEXTO)
        for inc in incidentes:
            lugar = inc.get("lugar") or "Lugar no especificado"
            pdf.cell(0, 7, f"-  {lugar}")
            pdf.ln(6)

    # Certificados
    _seccion(pdf, f"Certificados emitidos ({len(certificados)})")
    if not certificados:
        _fila_vacia(pdf, "No se emitieron certificados este día.")
    else:
        pdf.set_font("Helvetica", "", 11)
        pdf.set_text_color(*GRIS_TEXTO)
        for cert in certificados:
            codigo = cert.get("codigo") or "-"
            curso_nombre = cert.get("curso") or "Curso sin nombre"
            pdf.cell(0, 7, f"-  {codigo}   {curso_nombre}")
            pdf.ln(6)

    # Pie de página: se agrega justo después del último bloque de contenido
    # (no fijo al fondo de la página) para que nunca se sobreponga con un
    # reporte largo que ya haya empujado el cursor cerca del margen inferior.
    pdf.ln(6)
    pdf.set_draw_color(*GRIS_CLARO)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
    pdf.ln(3)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(130, 130, 130)
    generado_por = reporte.usuario.nombre if reporte.usuario else "usuario eliminado"
    generado_el = reporte.fecha_creacion.strftime("%d/%m/%Y %H:%M") if reporte.fecha_creacion else "-"
    pdf.cell(0, 6, f"Generado por {generado_por} el {generado_el}")

    salida = pdf.output()
    return bytes(salida)
