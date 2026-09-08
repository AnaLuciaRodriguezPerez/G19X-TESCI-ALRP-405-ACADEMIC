from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid

router = APIRouter(prefix="/api/documentos", tags=["documentos"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

TAMANO_MAXIMO = 10 * 1024 * 1024  # 10 MB

@router.post("/subir")
async def subir_documento(archivo: UploadFile = File(...)):
    # 1. Validar extensión
    extension = Path(archivo.filename).suffix.lower()
    if extension != ".pdf":
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF.")

    # 2. Validar tipo MIME
    if archivo.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="El archivo no es un PDF válido.")

    contenido = await archivo.read()

    # 3. Validar tamaño
    if len(contenido) > TAMANO_MAXIMO:
        raise HTTPException(status_code=400, detail="El archivo supera los 10 MB permitidos.")

    # 4. Validar firma real del PDF (todo PDF empieza con %PDF)
    if not contenido.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="El archivo está corrupto o no es un PDF real.")

    # 5. Guardar con nombre único para no sobrescribir
    nombre_unico = f"{uuid.uuid4()}.pdf"
    ruta = UPLOAD_DIR / nombre_unico
    ruta.write_bytes(contenido)

    return {
        "mensaje": "Documento cargado exitosamente",
        "nombre_original": archivo.filename,
        "nombre_guardado": nombre_unico,
        "tamano_bytes": len(contenido),
    }