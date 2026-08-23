-- Historial academico por usuario
SELECT
    u.numero_identificacion AS documento,
    CONCAT(u.nombre, ' ', u.apellido) AS participante,
    c.nombre_curso,
    pc.fecha,
    pc.hora,
    i.estado,
    i.nota_teorica,
    i.nota_practica
FROM usuarios u
JOIN inscripciones i
    ON u.id_usuario = i.id_usuario
JOIN programacion_cursos pc
    ON i.id_programacion = pc.id_programacion
JOIN cursos c
    ON pc.id_curso = c.id_curso
WHERE u.numero_identificacion = 1091111111;

-- Trabajadores incritos en un curso
SELECT
    CONCAT(u.nombre,' ',u.apellido) AS participante,
    u.numero_identificacion,
    i.estado
FROM cursos c
JOIN programacion_cursos pc
    ON c.id_curso = pc.id_curso
JOIN inscripciones i
    ON pc.id_programacion = i.id_programacion
JOIN usuarios u
    ON i.id_usuario = u.id_usuario
WHERE c.nombre_curso = 'Trabajador Autorizado';

--cursos por instructor
SELECT
    CONCAT(u.nombre,' ',u.apellido) AS instructor,
    c.nombre_curso,
    pc.fecha,
    pc.hora,
    pc.cupos
FROM usuarios u
JOIN programacion_cursos pc
    ON u.id_usuario = pc.id_usuario
JOIN cursos c
    ON pc.id_curso = c.id_curso
WHERE u.numero_identificacion = 1012345678;

--Participantes con certificado vigente

SELECT
    CONCAT(u.nombre,' ',u.apellido) AS participante,
    u.numero_identificacion,
    c.nombre_curso,
    cert.fecha_vencimiento
FROM certificados cert
JOIN usuarios u
    ON cert.id_usuario = u.id_usuario
JOIN cursos c
    ON cert.id_curso = c.id_curso
WHERE cert.fecha_vencimiento >= CURDATE();

-- participantes con certificados a punto de vencer

SELECT
    CONCAT(u.nombre,' ',u.apellido) AS participante,
    c.nombre_curso,
    cert.fecha_vencimiento
FROM certificados cert
JOIN usuarios u
    ON cert.id_usuario = u.id_usuario
JOIN cursos c
    ON cert.id_curso = c.id_curso
WHERE MONTH(cert.fecha_vencimiento) = MONTH(CURDATE())
AND YEAR(cert.fecha_vencimiento) = YEAR(CURDATE());

-- curso programado para una fecha determinada

SELECT
    c.nombre_curso,
    pc.fecha,
    pc.hora,
    CONCAT(u.nombre,' ',u.apellido) AS instructor,
    pc.cupos
FROM programacion_cursos pc
JOIN cursos c
    ON pc.id_curso = c.id_curso
JOIN usuarios u
    ON pc.id_usuario = u.id_usuario
WHERE pc.fecha = '2026-07-15';

-- participantes aptos para realizar curso

SELECT
    CONCAT(u.nombre,' ',u.apellido) AS participante,
    u.numero_identificacion,
    s.apto,
    s.fecha_vencimiento
FROM salud s
JOIN usuarios u
    ON s.id_trabajador = u.id_usuario
WHERE s.apto = 'SI';

-- participantes por empresa

SELECT
    CONCAT(t.nombre,' ',t.apellido) AS participante,
    t.numero_identificacion,
    r.nombre_rol
FROM usuarios e
JOIN usuarios t
    ON e.id_usuario = t.id_empresa
JOIN roles r
    ON t.id_rol = r.id_rol
WHERE e.nombre = 'TITAN-ES SEGURIDAD EN ALTURAS'
AND r.nombre_rol = 'Participante';

-- 