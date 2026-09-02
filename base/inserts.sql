-- El cliente mysql que usa docker-entrypoint-initdb.d para importar este
-- archivo se conecta con character_set_client=latin1 por defecto, aunque la
-- base de datos es utf8mb4 — sin este SET NAMES, cada tilde/ñ del archivo
-- (ya en UTF-8 correcto) se reinterpreta como Latin-1 y se re-codifica mal
-- al guardarse (ej. "Bogotá" queda como "BogotÃ¡" en la base de datos).
SET NAMES utf8mb4;

INSERT INTO roles(nombre_rol)
VALUES
('Administrador'),
('Instructor'),
('Participante'),
('Empresa');

INSERT INTO tipo_identificacion(nombre)
VALUES
('CC'),
('CE'),
('PPT'),
('TI'),
('Pasaporte'),
('NIT');

INSERT INTO tipos_accidente(nombre)
VALUES
('Caída de altura'),
('Golpe por objeto'),
('Atrapamiento'),
('Corte/laceración'),
('Otro');

-- Contraseñas sembradas en texto plano históricamente ('123' / 'empresa123') ahora
-- van como hash bcrypt (generado con be/scripts/hash_seed_passwords.py) para que
-- verify_password() funcione contra datos reales. Los valores en texto plano
-- siguen sirviendo para iniciar sesión en desarrollo.
INSERT INTO usuarios(tipo_registro, nombre, nit, direccion, telefono, correo, password_hash, id_tipo, id_rol)
VALUES
('empresa', 'TITAN-ES SEGURIDAD EN ALTURAS', 900123456, 'Bogotá D.C.', 6015555555, 'contacto@titan-es.com', '$2b$12$uBSvqT2HAmHyUyXAVvgP6e4Zg0CEcaM.43RZHbCqndR3r35LBwNKe', 3, 1);

INSERT INTO usuarios(tipo_registro, nombre, nit, direccion, telefono, correo, password_hash, id_tipo, id_rol)
VALUES
('empresa', 'Constructora Andina SAS', 900987654, 'Medellín', 6042223344, 'contacto@constructora-andina.com', '$2b$12$uBSvqT2HAmHyUyXAVvgP6e4Zg0CEcaM.43RZHbCqndR3r35LBwNKe', 6, 4);

INSERT INTO usuarios(tipo_registro,nombre,apellido,id_tipo,numero_identificacion,direccion,telefono,correo,password_hash,id_empresa,id_rol
)
VALUES
('usuario','Carlos','Ramirez',1,1012345678,'Bogotá',3001111111,'carlos@titan-es.com','$2b$12$DvxGF0qHFj4hPyTPhouEMOonXhpc6Nf4aAobqp9mUzaaDqAITSCV.',1,2),

('usuario','Andrea','Morales',1,1023456789,'Bogotá',3002222222,'andrea@titan-es.com','$2b$12$DvxGF0qHFj4hPyTPhouEMOonXhpc6Nf4aAobqp9mUzaaDqAITSCV.',1,2),

('usuario','Jorge','Castillo',1,1034567890,'Bogotá',3003333333,'jorge@titan-es.com','$2b$12$DvxGF0qHFj4hPyTPhouEMOonXhpc6Nf4aAobqp9mUzaaDqAITSCV.',1,2);
INSERT INTO usuarios(tipo_registro,nombre,apellido,id_tipo, numero_identificacion,direccion,telefono,correo,password_hash,id_empresa,id_rol
)
VALUES

('trabajador','Juan','Perez',1,1091111111,'Bogotá',3101111111,'juan@gmail.com','$2b$12$DvxGF0qHFj4hPyTPhouEMOonXhpc6Nf4aAobqp9mUzaaDqAITSCV.',1,3),

('trabajador','Laura','Gomez',3,987654321,'Bogotá',3102222222,'laura@gmail.com','$2b$12$DvxGF0qHFj4hPyTPhouEMOonXhpc6Nf4aAobqp9mUzaaDqAITSCV.',1,3),

('trabajador','Miguel','Torres',3,987654322,'Bogotá',3103333333,'miguel@gmail.com','$2b$12$DvxGF0qHFj4hPyTPhouEMOonXhpc6Nf4aAobqp9mUzaaDqAITSCV.',1,3),

('trabajador','Camila','Ruiz',1,1094444444,'Bogotá',3104444444,'camila@gmail.com','$2b$12$DvxGF0qHFj4hPyTPhouEMOonXhpc6Nf4aAobqp9mUzaaDqAITSCV.',1,3),

('trabajador','David','Rojas',3,987654323,'Bogotá',3105555555,'david@gmail.com','$2b$12$DvxGF0qHFj4hPyTPhouEMOonXhpc6Nf4aAobqp9mUzaaDqAITSCV.',1,3),

('trabajador','Sofia','Mendoza',1,1096666666,'Bogotá',3106666666,'sofia@gmail.com','$2b$12$DvxGF0qHFj4hPyTPhouEMOonXhpc6Nf4aAobqp9mUzaaDqAITSCV.',1,3),

('trabajador','Daniel','Vargas',1,1097777777,'Bogotá',3107777777,'daniel@gmail.com','$2b$12$DvxGF0qHFj4hPyTPhouEMOonXhpc6Nf4aAobqp9mUzaaDqAITSCV.',1,3);

INSERT INTO cursos(
nombre_curso,
intensidad_horaria
)
VALUES

('Trabajador Autorizado',32),
('Reentrenamiento',8),
('Coordinador de Trabajo en Alturas',80);
INSERT INTO salud(
apto,
restricciones,
observaciones,
fecha_examen,
fecha_vencimiento,
id_trabajador
)
VALUES

('SI','Ninguna','Apto','2026-01-10','2027-01-10',5),
('SI','Ninguna','Apto','2026-01-10','2027-01-10',6),
('SI','Ninguna','Apto','2026-01-10','2027-01-10',7),
('SI','Ninguna','Apto','2026-01-10','2027-01-10',8),
('SI','Ninguna','Apto','2026-01-10','2027-01-10',9),
('SI','Ninguna','Apto','2026-01-10','2027-01-10',10),
('SI','Ninguna','Apto','2026-01-10','2027-01-10',11);

INSERT INTO certificados(
codigo,
fecha_emision,
fecha_vencimiento,
id_curso,
id_usuario
)
VALUES

('CERT-001','2026-01-01','2027-01-01',1,5),
('CERT-002','2026-01-01','2027-01-01',1,6),
('CERT-003','2026-01-01','2027-01-01',1,7),
('CERT-004','2026-01-01','2027-01-01',1,8);
INSERT INTO programacion_cursos(
id_curso,
fecha,
hora,
cupos,
id_usuario
)
VALUES

(1,'2026-07-15','08:00:00',20,5),
(2,'2026-07-20','08:00:00',15,3),
(3,'2026-08-01','07:00:00',20,4);
INSERT INTO inscripciones(
id_programacion,
id_usuario,
estado,
nota_teorica,
nota_practica
)
VALUES

(1,5,'inscrito',4.5,4.8),
(1,6,'inscrito',4.3,4.4),
(1,7,'inscrito',4.7,4.9),

(2,5,'inscrito',NULL,NULL),
(2,6,'inscrito',NULL,NULL),

(3,8,'inscrito',NULL,NULL),
(3,9,'inscrito',NULL,NULL),
(3,10,'inscrito',NULL,NULL),
(3,11,'inscrito',NULL,NULL);

INSERT INTO metodo_pago(nombre)
VALUES
('Efectivo'),
('Transferencia bancaria'),
('Tarjeta de crédito/débito');
