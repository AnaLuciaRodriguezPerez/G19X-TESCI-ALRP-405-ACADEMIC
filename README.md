# Sistema de Validación Documental Basado en Reglas Jurídicas

**Alumno:** Ana Lucía Rodríguez Pérez **Matrícula:** G19X-TESCI-ALRP-405
**Institución:** Tecnológico de Estudios Superiores de Cuautitlán Izcalli

## Qué hace

DocuVerify es un sistema web para la validación documental basada en reglas jurídicas. Permite cargar documentos, analizarlos con apoyo de inteligencia artificial mediante Google Gemini y verificar el cumplimiento de cláusulas o criterios definidos para cada tipo de documento. El sistema está dirigido a usuarios que necesitan una revisión documental inicial y a administradores encargados de gestionar el catálogo de tipos de documentos, las reglas jurídicas y los usuarios de la plataforma.

## Qué necesitas instalado

- Python 3.14.7
- Node.js 24.15.0
- PostgreSQL 18

## Base de datos

1. Crea una base vacía llamada `docuverify_db`.
2. Importa `db/base-de-datos.sql` (trae la estructura y datos de prueba).

## Configuración

Copia `.env.example` a `.env` y llena los valores (los reales están en
«Accesos de prueba», en Mis documentos).

## Cómo instalarlo y ejecutarlo

```
cd Backend-Servidor
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```
Se abre en http://127.0.0.1:8000/docs

```
cd Frontend-Visual
npm install
npm run dev
```

Se abre en http://localhost:5173

## Usuario de prueba

usuario (admin): docuverify.sistema@gmail.com
usuario: usuariodepruebasistema@gmail.com

## Lo que todavía no funciona

- RF-017: El panel de estadísticas del administrador aún no muestra las gráficas y estadísticas completas de uso.
- RF-019 y RF-020: El historial global de auditoría para administradores aún no oculta completamente el documento original, mostrando solo los metadatos.
- RF-018: La administración completa de usuarios (suspender, restablecer contraseñas) aún no está terminada.