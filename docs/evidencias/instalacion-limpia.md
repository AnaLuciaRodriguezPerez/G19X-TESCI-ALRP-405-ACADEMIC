# Instalación en carpeta limpia — 27/10/20226 · commit cb8bb49

| Paso | Qué hice | Resultado |
|---|---|---|
| 1 | git clone en C:\prueba-limpia | Bien |
| 2 | Crear docuverify_db e importar db/base-de-datos.sql | Bien |
| 3 | .env del backend y del frontend | Bien |
| 4 | uvicorn main:app --reload y npm run dev |  Bien, pero hubo un error de dependencias con chart.js y react-chartjs-2 al iniciar el frontend, se corrigió reinstalando las librerías|
| 5 | Usuario: analizar NDA, guardar, ver historial | Bien |
| 6 | Admin: estadísticas, usuarios, reglas, historial global | Bien |
| 7 | npm run lint y npm run build | Bien |