DROP DATABASE IF EXISTS titan;
CREATE DATABASE titan;
USE titan;
CREATE TABLE roles(
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nombre_rol VARCHAR(50) NOT NULL
);

CREATE TABLE tipo_identificacion(
    id_tipo INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(20) NOT NULL
);
CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    tipo_registro ENUM('empresa', 'trabajador', 'usuario') NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150),
    id_tipo INT,
    numero_identificacion BIGINT,
    nit BIGINT,
    direccion VARCHAR(200),
    telefono BIGINT,
    correo VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    estado_activo BOOLEAN DEFAULT TRUE,
    id_empresa INT,
    id_rol INT,
    FOREIGN KEY (id_tipo) REFERENCES tipo_identificacion(id_tipo),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    FOREIGN KEY (id_empresa) REFERENCES usuarios(id_usuario)
);
CREATE TABLE cursos(
    id_curso INT PRIMARY KEY AUTO_INCREMENT,
    nombre_curso VARCHAR(100),
    intensidad_horaria INT
);

CREATE TABLE certificados(
    id_certificado INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20),
    fecha_emision DATE,
    fecha_vencimiento DATE,
    id_curso INT,
    id_usuario INT,
	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
);
CREATE TABLE indumentaria(
    id_indumentaria INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    descripcion VARCHAR(200)
);

CREATE TABLE inspecciones_indumentaria(
    id_inspeccion INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE,
    id_indumentaria INT,
    id_usuario INT,
    observaciones VARCHAR(200),
    resultado ENUM('apto', 'no_apto'),
    FOREIGN KEY (id_indumentaria) REFERENCES indumentaria(id_indumentaria),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
CREATE TABLE metodo_pago(
    id_metodo INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50)
);

CREATE TABLE facturas(
    id_factura INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE,
    id_empresa INT,
    FOREIGN KEY (id_empresa) REFERENCES usuarios(id_usuario)
);

CREATE TABLE detalle_factura(
    id_detalle INT PRIMARY KEY AUTO_INCREMENT,
    id_factura INT,
    descripcion VARCHAR(100),
    valor DECIMAL(10,2),
    FOREIGN KEY (id_factura) REFERENCES facturas(id_factura) ON DELETE CASCADE
);

CREATE TABLE pagos(
    id_pago INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE,
    monto DECIMAL(10,2),
    id_factura INT,
    id_metodo INT,
    FOREIGN KEY (id_factura) REFERENCES facturas(id_factura) ON DELETE RESTRICT,
    FOREIGN KEY (id_metodo) REFERENCES metodo_pago(id_metodo)
);
CREATE TABLE documentos(
    id_documento INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    descripcion VARCHAR(200),
    ruta_archivo VARCHAR(255) NOT NULL, -- ¡Importante para saber dónde está el PDF!
    id_usuario INT NULL, -- Será nulo si el documento es de un trabajador
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (id_usuario)    REFERENCES usuarios(id_usuario)       ON DELETE SET NULL
);
CREATE TABLE salud(
    id_salud INT PRIMARY KEY AUTO_INCREMENT,
    apto ENUM('SI','NO'),
    restricciones VARCHAR(300),
    observaciones VARCHAR(500),
    fecha_examen DATE,
    fecha_vencimiento DATE,
    id_trabajador INT,
    FOREIGN KEY (id_trabajador) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
);
CREATE TABLE disponibilidad(
    id_disponibilidad INT PRIMARY KEY AUTO_INCREMENT,
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    disponible ENUM('SI','NO'),
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
CREATE TABLE evaluaciones(
    id_evaluacion INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    id_curso INT,
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
);

CREATE TABLE preguntas(
    id_pregunta INT PRIMARY KEY AUTO_INCREMENT,
    pregunta TEXT,
    id_evaluacion INT,
    FOREIGN KEY (id_evaluacion) REFERENCES evaluaciones(id_evaluacion)
);

CREATE TABLE respuestas(
    id_respuesta INT PRIMARY KEY AUTO_INCREMENT,
    respuesta TEXT,
    es_correcta BOOLEAN,
    id_pregunta INT,
    FOREIGN KEY (id_pregunta) REFERENCES preguntas(id_pregunta) ON DELETE CASCADE
);

CREATE TABLE evaluaciones_presentadas(
    id_presentada INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    id_evaluacion INT,
    fecha DATE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_evaluacion) REFERENCES evaluaciones(id_evaluacion)
);

CREATE TABLE resultados(
    id_resultado INT PRIMARY KEY AUTO_INCREMENT,
    id_presentada INT,
    puntaje DECIMAL(5,2),
    FOREIGN KEY (id_presentada) REFERENCES evaluaciones_presentadas(id_presentada)
);
CREATE TABLE tipos_accidente(
    id_tipo_accidente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE accidentes(
    id_accidente INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE,
    lugar VARCHAR(200),
    id_trabajador INT,
    id_tipo_accidente INT,
    descripcion TEXT,
    estado ENUM('abierto', 'en_seguimiento', 'cerrado') DEFAULT 'abierto',
    FOREIGN KEY (id_trabajador) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    FOREIGN KEY (id_tipo_accidente) REFERENCES tipos_accidente(id_tipo_accidente)
);
CREATE TABLE historial_estado_incidente(
    id_historial INT PRIMARY KEY AUTO_INCREMENT,
    id_accidente INT,
    estado_anterior ENUM('abierto', 'en_seguimiento', 'cerrado'),
    estado_nuevo ENUM('abierto', 'en_seguimiento', 'cerrado'),
    id_usuario INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_accidente) REFERENCES accidentes(id_accidente) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
CREATE TABLE evidencias_incidente(
    id_evidencia INT PRIMARY KEY AUTO_INCREMENT,
    id_accidente INT,
    nombre VARCHAR(150),
    ruta_archivo VARCHAR(300),
    tipo VARCHAR(50),
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_accidente) REFERENCES accidentes(id_accidente) ON DELETE CASCADE
);
CREATE TABLE tipos_alerta(
    id_tipo_alerta INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100)
);

CREATE TABLE alertas(
    id_alerta INT PRIMARY KEY AUTO_INCREMENT,
    id_tipo_alerta INT,
    fecha_vencimiento DATE,
    estado ENUM('pendiente','enviada','vencida'),
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_tipo_alerta) REFERENCES tipos_alerta(id_tipo_alerta)
);
CREATE TABLE programacion_cursos(
    id_programacion INT PRIMARY KEY AUTO_INCREMENT,
    id_curso INT,
    fecha DATE,
    hora TIME,
    cupos INT,
    id_usuario INT,
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
CREATE TABLE inscripciones(
    id_inscripcion INT PRIMARY KEY AUTO_INCREMENT,
    id_programacion INT,
    id_usuario INT,
    estado ENUM('inscrito','cancelado'),
    fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
    nota_teorica DECIMAL(5,2) NULL,
    nota_practica DECIMAL(5,2) NULL,
    FOREIGN KEY (id_programacion) REFERENCES programacion_cursos(id_programacion),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);
CREATE TABLE asistencias(
    id_asistencia INT PRIMARY KEY AUTO_INCREMENT,
    id_inscripcion INT,
    asistio BOOLEAN,
    FOREIGN KEY (id_inscripcion) REFERENCES inscripciones(id_inscripcion) ON DELETE CASCADE
);

CREATE TABLE certificados_indumentaria(
    id_certificado_equipo INT PRIMARY KEY AUTO_INCREMENT,
    id_indumentaria INT,
    fecha_emision DATE,
    fecha_vencimiento DATE,
    estado ENUM('apto','no_apto'),
    FOREIGN KEY (id_indumentaria) REFERENCES indumentaria(id_indumentaria)
);