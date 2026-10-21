-- SCRIPT DE BASE DE DATOS: DocuVerify
-- Sistema Gestor: PostgreSQL


-- CREACION DE TABLAS


-- 1. Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    foto VARCHAR(255),
    email_verificado BOOLEAN DEFAULT FALSE,
    rol VARCHAR(50) DEFAULT 'usuario',
    activo BOOLEAN DEFAULT TRUE
);

-- 2. Tabla: tipos_documento
CREATE TABLE IF NOT EXISTS tipos_documento (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- 3. Tabla: reglas_juridicas
CREATE TABLE IF NOT EXISTS reglas_juridicas (
    id SERIAL PRIMARY KEY,
    tipo_documento_id INTEGER REFERENCES tipos_documento(id) ON DELETE CASCADE,
    nombre_clausula VARCHAR(150) NOT NULL,
    es_obligatoria BOOLEAN DEFAULT TRUE,
    criterio_evaluacion TEXT NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla: analisis_resultados
CREATE TABLE IF NOT EXISTS analisis_resultados (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL, 
    tipo_documento_id INTEGER REFERENCES tipos_documento(id),
    nombre_archivo VARCHAR(255) NOT NULL,
    resultado_ia JSONB NOT NULL,
    fecha_analisis TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla: tokens_recuperacion
CREATE TABLE IF NOT EXISTS tokens_recuperacion (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    token_hash VARCHAR(64),
    expira_en TIMESTAMP WITH TIME ZONE,
    usado BOOLEAN,
    creado_en TIMESTAMP WITH TIME ZONE
);

-- 6. Tabla: tokens_verificacion
CREATE TABLE IF NOT EXISTS tokens_verificacion (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    token_hash VARCHAR(64),
    expira_en TIMESTAMP WITH TIME ZONE,
    usado BOOLEAN,
    creado_en TIMESTAMP WITH TIME ZONE
);


-- INSERCIÓN DE DATOS


-- Insertar usuario regular (Contraseña: Prueba-1)
INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, email, contrasena, email_verificado, rol)
VALUES ('Elias', 'Pérez', 'Gómez', 'usuariodepruebasistema@gmail.com', '$2b$12$K89sO9p0xP.sJgS1oJ4o.eU3jB0Xk8G/J0s5l/J3a5m5J5m5J5m5', TRUE, 'usuario');

-- Insertar usuario administrador (Contraseña: Sistema-1)
INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, email, contrasena, email_verificado, rol)
VALUES ('Administrador', 'Sistema', 'Sistema', 'docuverify.sistema@gmail.com', '$2b$12$M9B3wGwKk9N9I9v9L9z9v.YR82X.a7c1d3f5h7j9l1n3p5r7t9v1w', TRUE, 'admin');

-- Insertar tipo de documento
INSERT INTO tipos_documento (nombre, descripcion) 
VALUES ('Acuerdo de Confidencialidad (NDA)', 'Contrato utilizado para proteger información sensible compartida entre dos o más partes.');

-- Insertar reglas jurídicas
INSERT INTO reglas_juridicas (tipo_documento_id, nombre_clausula, es_obligatoria, criterio_evaluacion) VALUES 
(1, 'Identificación de las Partes (Proemio)', TRUE, 'Verificar que el contrato identifique claramente a las partes involucradas (Parte Reveladora y Parte Receptora), incluyendo nombres, razones sociales o representantes legales.'),
(1, 'Definición de Información Confidencial', TRUE, 'El documento debe detallar de manera clara y específica qué se considera Información Confidencial (ej. secretos industriales, bases de datos, planes de negocio, software, etc.).'),
(1, 'Uso Permitido (Objeto)', TRUE, 'El contrato debe especificar para qué propósito o proyecto la Parte Receptora puede utilizar la información confidencial (ej. "evaluar una posible relación comercial" o "desarrollo de un proyecto de software").'),
(1, 'Excepciones de Confidencialidad', TRUE, 'Debe incluir supuestos donde la información deja de ser confidencial (ej. información de dominio público, obtenida legítimamente de terceros, o requerida por orden judicial o autoridad competente).'),
(1, 'Vigencia y Plazo de la Obligación', TRUE, 'Debe establecer claramente cuánto tiempo dura el contrato y por cuánto tiempo se mantiene la obligación de confidencialidad después de terminado el contrato (ej. 2, 3 o 5 años posteriores).'),
(1, 'Devolución o Destrucción de Información', TRUE, 'Debe incluir una cláusula que obligue a la Parte Receptora a devolver o destruir la información confidencial una vez terminado el contrato o si la Parte Reveladora lo solicita.'),
(1, 'Penas Convencionales / Sanciones', FALSE, 'Verificar si el contrato establece una penalidad económica específica, indemnización por daños y perjuicios, o consecuencias claras en caso de incumplimiento por parte de la Parte Receptora.'),
(1, 'Jurisdicción y Legislación Aplicable', TRUE, 'El contrato debe establecer bajo qué leyes se rige (ej. Leyes de los Estados Unidos Mexicanos) y a qué tribunales se someterán en caso de controversia (ej. Tribunales de la Ciudad de México).');