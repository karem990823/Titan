const API_URL = 'http://localhost:3001/api';

async function cargarRequisitos() {
  const cursoId = document.getElementById('curso_id').value;
  const reqInfo = document.getElementById('req-info');
  
  try {
    const res = await fetch(`${API_URL}/cursos/${cursoId}/requisitos`);
    const data = await res.json();
    
    reqInfo.innerHTML = `<strong>Requisito previo:</strong> ${data.requisito_texto}`;
  } catch (err) {
    reqInfo.innerHTML = 'Error al consultar requisitos del curso.';
  }
}

async function inscribir() {
  const cursoId = document.getElementById('curso_id').value;
  const participanteId = document.getElementById('participante_id').value;
  const mensajeDiv = document.getElementById('mensaje');

  mensajeDiv.style.display = 'none';

  if (!participanteId) {
    alert('Ingrese el documento del participante');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/inscripciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participante_id: participanteId, curso_id: cursoId })
    });

    const data = await res.json();

    mensajeDiv.style.display = 'block';
    if (res.ok) {
      mensajeDiv.className = 'alert alert-success';
      mensajeDiv.innerText = data.mensaje;
    } else {
      // CA-02: Muestra mensaje de bloqueo específico
      mensajeDiv.className = 'alert alert-error';
      mensajeDiv.innerText = data.mensaje || data.error;
    }
  } catch (err) {
    mensajeDiv.style.display = 'block';
    mensajeDiv.className = 'alert alert-error';
    mensajeDiv.innerText = 'Error de conexión con el servidor backend.';
  }
}

// Carga inicial
cargarRequisitos();