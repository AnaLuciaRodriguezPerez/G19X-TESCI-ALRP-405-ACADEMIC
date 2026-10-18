# PRD - Sistema de Validación Documental Basado en Reglas Jurídicas

## Introducción

La automatización de procesos legales (LegalTech) se ha convertido en una herramienta importante para optimizar la revisión de documentos y reducir posibles riesgos relacionados con el cumplimiento de requisitos legales. En este contexto, surge el Sistema de Validación Documental Basado en Reglas Jurídicas, un proyecto enfocado en facilitar y agilizar el proceso de revisión de documentos legales.

El sistema integra un motor de reglas configurable junto con la API de Google Gemini, permitiendo analizar la estructura de los documentos, verificar el cumplimiento de cláusulas obligatorias y generar resultados de validación de manera automatizada.

El desarrollo utiliza tecnologías como Python con FastAPI, React.js y PostgreSQL, y se gestiona bajo la metodología Scrum. Con ello, se busca proporcionar una herramienta que reduzca el tiempo necesario para revisar documentos legales y facilite la identificación de posibles incumplimientos de manera rápida y organizada.

## Descripción del proyecto

Proyecto de Desarrollo de un Sistema de Validación Documental Basado en Reglas Jurídicas

**Tecnologías / Herramientas / Metodologías aplicables:**
- Python
- FastAPI
- React.js
- PostgreSQL
- Scrum
- Google Gemini API

**Delimitación del proyecto:**
El sistema validará automáticamente documentos jurídicos y corporativos mediante un motor de reglas configurable, verificando estructura, obligatoriedad de cláusulas, consistencia de datos, referencias normativas, formatos y cumplimiento de políticas internas. Integrará inteligencia artificial para apoyar la interpretación documental y generar observaciones y recomendaciones.

**Objetivo general:**
Desarrollar un sistema inteligente para la validación documental basada en reglas jurídicas.

**Objetivos específicos:**
- Analizar criterios jurídicos y reglas de validación.
- Diseñar la arquitectura tecnológica.
- Implementar el motor de reglas y validación documental.
- Validar precisión, integridad y desempeño.
- Elaborar documentación técnica y plan de soporte.

**Justificación:**
- Impacto en la Industria: Reduce errores documentales y fortalece el cumplimiento jurídico.
- Valor para PluriOne: Amplía el portafolio LegalTech con soluciones de validación inteligente.
- Desarrollo del Alumno: Fortalece competencias en IA, automatización documental, arquitectura empresarial y desarrollo de software.

## Alcance del proyecto

### Qué incluirá el sistema (¿Qué es?)

El Sistema de Validación Documental tendrá como alcance permitir a los usuarios cargar documentos jurídicos o corporativos para realizar un proceso automatizado de validación basado en reglas previamente definidas para cada tipo de documento.

El sistema procesará el contenido de los documentos cargados y seleccionará el conjunto de reglas correspondiente a su tipo. A partir de estas reglas, realizará diferentes validaciones relacionadas con la estructura documental, la existencia de cláusulas obligatorias, la consistencia de la información, las referencias normativas y el formato del documento.

Como resultado del proceso, el sistema identificará los criterios cumplidos, incumplidos o que requieran revisión, además de generar observaciones y recomendaciones relacionadas con los hallazgos encontrados. Estos resultados serán presentados al usuario de manera clara para facilitar la revisión del documento.

Asimismo, el sistema permitirá registrar las validaciones realizadas y consultar posteriormente el historial de documentos procesados y sus respectivos resultados.

Además de la vista de usuario, el sistema integrará un módulo de administración. Este módulo permitirá a los usuarios con rol de administrador:

- Crear, editar y gestionar dinámicamente nuevos tipos de documentos y sus reglas jurídicas asociadas, sin necesidad de desarrollo de software adicional.
- Administrar los accesos y roles de los usuarios de la plataforma.
- Visualizar un panel de control (dashboard) con gráficas y estadísticas de uso de la plataforma.
- Consultar un historial global de auditoría que mostrará las validaciones realizadas en el sistema protegiendo la confidencialidad (se mostrarán únicamente metadatos de la operación, bloqueando por completo la visualización o descarga del documento original por parte del administrador).

El acceso al sistema estará protegido mediante autenticación (inicio de sesión), y durante el procesamiento se conservará en todo momento la integridad y privacidad del documento original. El sistema funcionará como una herramienta de apoyo para la revisión documental y no sustituirá la revisión o interpretación realizada por un profesional jurídico.

### Qué no incluirá (Qué no es)

El Sistema de Validación Documental no incluirá las siguientes funcionalidades o actividades:

- La elaboración o redacción automática de documentos jurídicos desde cero.
- La modificación automática del documento original por parte del sistema.
- La firma electrónica o digital de los documentos.
- La gestión, almacenamiento o administración de expedientes jurídicos completos. (el sistema no es un repositorio documental o gestor de archivos, los documentos se procesan únicamente para su validación).
- La representación o asesoría jurídica por parte del sistema.
- La sustitución de la revisión realizada por un profesional jurídico.
- La interpretación de situaciones jurídicas que no se encuentren contempladas dentro de las reglas de validación definidas.
- La conexión con sistemas externos de instituciones gubernamentales, despachos jurídicos o plataformas de gestión documental.
- La validación de documentos que no cuenten con un conjunto de reglas definido dentro del sistema.
- La gestión de procesos legales, demandas, trámites o procedimientos jurídicos.
- La emisión de opiniones o dictámenes jurídicos con carácter legal.

El sistema se limitará a realizar a analizar y validar de los documentos de acuerdo con las reglas previamente establecidas en su motor y a presentar los resultados, observaciones y estadísticas correspondientes como apoyo al proceso operativo y de revisión.

### Límites del MVP

El Producto Mínimo Viable (MVP) el sistema permitirá cargar y analizar este tipo de documento utilizando un conjunto de reglas previamente definido para identificar el cumplimiento de los criterios establecidos.

Durante esta primera versión, las validaciones estarán enfocadas en aspectos como la estructura del documento, la presencia de cláusulas obligatorias, la consistencia de la información, las referencias normativas y los criterios de formato que sean definidos para los contratos de confidencialidad.

**El MVP incluirá:**

- Generación y visualización de resultados, observaciones y recomendaciones derivadas del proceso de validación.
- Registro y consulta del historial de validaciones (historial personal para el usuario e historial global de auditoría para el administrador, sin acceso al documento original).
- Módulo de administración que permita:
  - Crear, editar y gestionar tipos de documentos.
  - Crear, editar y administrar reglas de validación asociadas a cada tipo.
  - Administrar usuarios y roles.
  - Visualizar un panel de estadísticas y gráficas de uso de la plataforma.

**Quedará fuera del alcance inicial del MVP:**

- La pre-carga o calibración exhaustiva de reglas para una gran cantidad de tipos de documentos (el sistema se entregará con la capacidad de administrarlos, pero la configuración masiva de catálogos extensos se considerará trabajo posterior o de consultoría).
- Integraciones con sistemas externos de terceros.
- Funcionalidades avanzadas de redacción, modificación o firma de documentos.
- La incorporación operativa de nuevos tipos de documentos y sus reglas quedará como responsabilidad del administrador mediante el uso del panel dinámico una vez entregado el sistema.

## Información general

**Nombre del proyecto:**
Sistema de Validación Documental Basado en Reglas Jurídicas

**Empresa:**
PluriOne S.A. de C.V. (Develop Talent & Technology)

**RFC:**
PLU060407HC9

**Dirección:**
Puebla 46, Col. Roma Norte, Alcaldía Cuauhtémoc, C.P. 06700, CDMX

**Líder de proyecto:**
Edgar Loheffelmman

**Asesor empresarial:**
Juan Méndez Herrera

## Requisitos funcionales

**RF-001 — Carga de documentos**
Descripción: El sistema deberá permitir al usuario cargar documentos jurídicos o corporativos para iniciar el proceso de validación.
Prioridad: Alta.

**RF-002 — Extracción del contenido documental**
Descripción: El sistema deberá procesar el documento cargado y extraer su contenido para permitir su análisis y validación.
Prioridad: Alta.

**RF-003 — Selección del conjunto de reglas**
Descripción: El sistema deberá asociar el documento con el conjunto de reglas de validación correspondiente a su tipo.
Prioridad: Alta.

**RF-004 — Validación de estructura documental**
Descripción: El sistema deberá verificar que el documento contenga los elementos estructurales definidos por las reglas correspondientes.
Prioridad: Alta.

**RF-005 — Validación de cláusulas obligatorias**
Descripción: El sistema deberá verificar la existencia de las cláusulas o elementos obligatorios definidos para el tipo de documento.
Prioridad: Alta.

**RF-006 — Validación de consistencia de información**
Descripción: El sistema deberá identificar posibles inconsistencias entre los datos contenidos dentro del documento.
Prioridad: Alta.

**RF-007 — Validación de referencias normativas**
Descripción: El sistema deberá verificar las referencias normativas establecidas dentro de las reglas de validación y señalar aquellas que requieran revisión.
Prioridad: Media/Alta.

**RF-008 — Validación de formato**
Descripción: El sistema deberá verificar que el documento cumpla con los criterios de formato establecidos en las reglas correspondientes.
Prioridad: Media.

**RF-009 — Generación de resultados**
Descripción: El sistema deberá generar un resultado de la validación indicando los criterios que fueron cumplidos, incumplidos o que requieren revisión.
Prioridad: Alta.

**RF-010 — Generación de observaciones**
Descripción: El sistema deberá generar observaciones relacionadas con los hallazgos identificados durante el proceso de validación.
Prioridad: Alta.

**RF-011 — Generación de recomendaciones**
Descripción: El sistema deberá proporcionar recomendaciones relacionadas con los hallazgos detectados, como apoyo al proceso de revisión documental.
Prioridad: Alta.

**RF-012 — Visualización de resultados**
Descripción: El sistema deberá presentar al usuario los resultados de la validación de manera clara, incluyendo los criterios evaluados, hallazgos, observaciones y recomendaciones.
Prioridad: Alta.

**RF-013 — Registro de validaciones**
Descripción: El sistema deberá registrar las validaciones realizadas y sus resultados para permitir su consulta posterior.
Prioridad: Media.

**RF-014 — Consulta del historial**
Descripción: El sistema deberá permitir consultar el historial de documentos previamente validados y sus resultados.
Prioridad: Media.

**RF-015 – Gestión de Tipos de Documentos**
Descripción: El sistema debe permitir a los usuarios con rol de Administrador crear, editar, habilitar y deshabilitar tipos de documentos jurídicos que la plataforma podrá analizar.
Prioridad: Alta.

**RF-016 – Motor de Reglas Dinámico**
Descripción: El sistema debe proporcionar una interfaz para que los administradores puedan agregar, modificar o eliminar reglas jurídicas y de validación asociadas a cada "Tipo de Documento".
Prioridad: Alta.

**RF-017 – Panel de Estadísticas (Dashboard)**
Descripción: El sistema debe incluir un panel exclusivo para el Administrador que muestre gráficas y estadísticas de uso de la plataforma (ej. cantidad de documentos procesados por fecha, porcentaje de documentos con hallazgos, usuarios más activos).
Prioridad: Media/Alta.

**RF-018 – Administración de Usuarios**
Descripción: El Administrador debe poder dar de alta, modificar, suspender o dar de baja a usuarios dentro de la plataforma, así como asignarles roles y restablecer contraseñas. (Esto se integra con Microsoft Entra ID según tu stack tecnológico).
Prioridad: Alta.

**RF-019 – Historial Global de Auditoría (Solo Admin)**
Descripción: El sistema debe permitir al Administrador visualizar un registro global de todas las validaciones realizadas por todos los usuarios (fecha, tipo de documento, estatus de validación).
Prioridad: Alta.

**RF-020 – Privacidad del Documento Original en Historial Global:**
Descripción: Como medida de seguridad y confidencialidad, el Historial Global accesible para el Administrador no debe permitir la visualización, descarga ni acceso al contenido del documento original cargado por el usuario estándar. Solo se mostrarán los metadatos de la operación.
Prioridad: Alta.

## Requerimientos no funcionales

**RNF-001 — Rendimiento**
Descripción: El sistema deberá procesar los documentos dentro de un tiempo razonable para proporcionar los resultados de validación al usuario sin afectar significativamente su flujo de trabajo.
Prioridad: Alta.

**RNF-002 — Usabilidad**
La interfaz deberá permitir que los usuarios puedan cargar documentos, ejecutar validaciones y consultar resultados de manera clara e intuitiva.
Prioridad: Alta.

**RNF-003 — Integridad**
El sistema deberá conservar la integridad del documento original durante su procesamiento y validación.
Prioridad: Alta.

**RNF-004 — Autenticación**
El acceso al sistema estará protegido mediante inicio de sesión.
Prioridad: Alta.

**RNF-005 – Confidencialidad de Datos**
Descripción: Los documentos cargados por los usuarios estarán aislados y no podrán ser leídos por otros usuarios ni por los administradores de la plataforma, garantizando el secreto profesional y corporativo.
Prioridad: Alta.