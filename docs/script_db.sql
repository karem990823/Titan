-- Estructura de BD solicitada en la Tarea Técnica
CREATE TABLE tipo_curso (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    exige_certificado_previo BOOLEAN DEFAULT FALSE
);

CREATE TABLE tipo_curso_requisito (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo_curso_id INT NOT NULL,
    requisito VARCHAR(100) NOT NULL,
    FOREIGN KEY (tipo_curso_id) REFERENCES tipo_curso(id)
);

-- Datos de prueba
INSERT INTO tipo_curso (id, nombre, exige_certificado_previo) VALUES 
(1, 'Curso Básico Alturas', FALSE),
(2, 'Curso Reentrenamiento Alturas', TRUE);

INSERT INTO tipo_curso_requisito (tipo_curso_id, requisito) VALUES 
(2, 'certificado_previo');