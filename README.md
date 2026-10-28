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


En la carpeta `Backend-Servidor/`, crea un archivo `.env` basado en `.env.example` que esta en la raiz (los valores de prueba están en «Accesos de prueba», en Mis documentos).

En la carpeta `Frontend-Visual/`, crea un archivo `.env` con la variable VITE_API_URL basado en `.env.example` que esta en la raiz (tambien se encuentra en el .env.example en la carpeta de Frontend-Visual).


## Cómo instalarlo y ejecutarlo

```
cd Backend-Servidor
python -m venv .venv
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

## Uso de IA

Se utilizo asistente de IA principalmente como consulta y apoyo para:

- Aprender cómo implementar la API de Google Gemini en el backend.
- Definir cómo estructurar el código para poder leer y enviar el contenido de los documentos PDF para su análisis con AI.
- Ayuda técnica para lograr implementar la configuración dinámica de colores dentro del sistema.

Las reglas jurídicas evaluadas, el diseño de la base de datos, la estructura general del proyecto y la revisión de cada cambio implementado los decidí y realicé yo.

## Lo que todavía no funciona

Dentro del codigo ya está implementado un funcionamiento para un chat pero actualmente dentro del proyecto no hay ningguna pantalla que lo utilice.