# Producto Mínimo Viable (MVP)

**Proyecto:** Sistema de Validación Documental Basado en Reglas Jurídicas
**Alumno:** Ana Lucía Rodríguez Pérez  

---

## 1. Resumen del MVP

El Producto Mínimo Viable (MVP) del Sistema de Validación Documental Basado en Reglas Jurídicas se centra en automatizar el proceso de revisión y validación de documentos jurídicos tipo Acuerdos de Confidencialidad (NDA). 

El sistema permite la carga de documentos en formato PDF, extrae su contenido y los evalúa contra un conjunto de reglas jurídicas mediante un motor impulsado por Google Gemini API, generando observaciones, recomendaciones e informes detallados del cumplimiento normativo.

---

## 2. Tecnologías e Infraestructura

- **Frontend:** React.js + Vite + Tailwind CSS / CSS.
- **Backend:** Python con FastAPI y Uvicorn.
- **Base de Datos:** PostgreSQL.
- **Inteligencia Artificial:** Google Gemini API (para evaluación de reglas).
- **Autenticación y Seguridad:** JWT (JSON Web Tokens) y cifrado de contraseñas con bcrypt.

---

## 3. Requisitos Funcionales Incluidos en el MVP

A partir de la especificación del PRD, los siguientes requisitos funcionales se encuentran completamente desarrollados y operativos en esta entrega del MVP:

### Proceso de Análisis y Validación
- **RF-001 (Carga de documentos):** Permitir la subida de contratos/documentos en formato PDF.
- **RF-002 (Extracción de contenido):** Extracción automatizada del texto del PDF cargado.
- **RF-003 (Selección de conjunto de reglas):** Asociación del documento con las reglas de Acuerdos de Confidencialidad (NDA).
- **RF-004 (Validación de estructura documental):** Verificación de elementos estructurales del contrato.
- **RF-005 (Validación de cláusulas obligatorias):** Verificación de presencia de cláusulas clave.
- **RF-006 (Validación de consistencia):** Identificación de posibles inconsistencias en el texto.
- **RF-007 (Referencias normativas):** Revisión del marco normativo aplicable.
- **RF-008 (Validación de formato):** Verificación de criterios de formato requeridos.

### Generación de Resultados
- **RF-009, RF-010, RF-011 y RF-012 (Resultados, Observaciones y Recomendaciones):** Generación y presentación clara del informe de evaluación con estatus de cumplimiento, observaciones y sugerencias jurídicas.

### Historial y Autenticación
- **RF-013 y RF-014 (Registro e Historial):** Almacenamiento de cada análisis y consulta del historial personal de evaluaciones de cada usuario.

### Administración Dinámica
- **RF-015 (Gestión de Tipos de Documentos):** Administración de tipos de documentos jurídicos.
- **RF-016 (Motor de Reglas Dinámico):** Interfaz para administradores que permite agregar, editar y eliminar reglas jurídicas asociadas a los tipos de documentos.

---

## 4. Requisitos Excluidos o Pendientes (Fuera del Alcance Actual del MVP)

Conforme a lo documentado en el proyecto, los siguientes módulos se reservan para fases posteriores de desarrollo:

- **RF-017 (Panel de Estadísticas):** El dashboard visual con gráficas completas de uso para el administrador se encuentra pendiente.
- **RF-018 (Administración Completa de Usuarios):** La gestión avanzada (suspender usuarios, restablecer contraseñas desde el panel) está pendiente de integración final.
- **RF-019 y RF-020 (Historial Global de Auditoría con Ocultamiento):** El panel de auditoría global con bloqueo estricto del documento original se implementará en la siguiente versión.

---

## 5. Criterios de Aceptación del MVP

1. El usuario debe ser capaz de registrarse.
2. El usuario debe poder subir un archivo PDF de NDA y recibir una evaluación estructurada por la IA.
3. El resultado debe guardarse automáticamente en la base de datos de PostgreSQL dentro de su historial personal.
4. El Administrador debe poder crear y editar reglas jurídicas desde el panel dinámico de administración.