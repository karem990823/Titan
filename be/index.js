const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simulación de Base de Datos
const TIPOS_CURSO = {
  1: { id: 1, nombre: 'Trabajo Seguro en Alturas - Básico', exige_certificado: false },
  2: { id: 2, nombre: 'Trabajo Seguro en Alturas - Reentrenamiento', exige_certificado: true }
};

const CERTIFICADOS_PARTICIPANTES = {
  '1001': { certificado_vigente: true, tipo_curso_id: 1 }, // Cumple
  '1002': { certificado_vigente: false, tipo_curso_id: 1 } // No cumple
};

// GET: Consultar requisitos del curso (Frontend CA-01)
app.get('/api/cursos/:id/requisitos', (req, res) => {
  const curso = TIPOS_CURSO[req.params.id];
  if (!curso) {
    return res.status(404).json({ error: 'Curso no encontrado' });
  }
  res.json({
    curso_id: curso.id,
    nombre: curso.nombre,
    exige_certificado_previo: curso.exige_certificado,
    requisito_texto: curso.exige_certificado 
      ? 'Certificado previo vigente del mismo tipo de formación' 
      : 'Ninguno'
  });
});

// POST: Validar e Inscribir Participante (Backend CA-02 / CA-03)
app.post('/api/inscripciones', (req, res) => {
  const { participante_id, curso_id } = req.body;
  const curso = TIPOS_CURSO[curso_id];

  if (!curso) {
    return res.status(400).json({ error: 'El curso especificado no existe.' });
  }

  // Validación si el tipo de curso exige certificado previo
  if (curso.exige_certificado) {
    const cert = CERTIFICADOS_PARTICIPANTES[participante_id];

    if (!cert || !cert.certificado_vigente) {
      // CA-02: Bloqueado con mensaje explicativo específico
      return res.status(422).json({
        exito: false,
        codigo_error: 'REQUISITO_NO_CUMPLIDO',
        mensaje: `Inscripción bloqueada: El participante con documento ${participante_id} no cuenta con un certificado previo vigente requerido para el curso de reentrenamiento.`
      });
    }
  }

  // CA-03: Inscripción exitosa
  return res.status(200).json({
    exito: true,
    mensaje: `Inscripción realizada con éxito para el participante ${participante_id} en el curso "${curso.nombre}".`
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`TITAN Backend corriendo en http://localhost:${PORT}`);
});