import asyncio
import json
import os
import shutil
import uuid
from typing import List, Optional

import bcrypt
import fitz
import google.generativeai as genai


# IMPORTS PARA CORREOS Y RECUPERACIÓN


import hashlib           
import secrets                    
import smtplib                   
import time                        
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

from dotenv import load_dotenv      # Para leer el archivo .env
from fastapi import BackgroundTasks # Para enviar correos sin hacer esperar al usuario

load_dotenv()  # Carga las variables del archivo .env



from database import Base, engine, get_db
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import models
from pydantic import BaseModel
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DocuVerify API")

os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/documentos", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)


# FUNCIONES DE ENCRIPTACIÓN


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode("utf-8")
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False



# ENDPOINT: Registrar Usuario


@app.post("/registro")
def registrar_usuario(
    nombre: str,
    apellido_paterno: str,
    apellido_materno: str,
    email: str,
    contrasena: str,
    background_tasks: BackgroundTasks,  # 👈 NUEVO: para enviar correo sin esperar
    db: Session = Depends(get_db),
):
    usuario_existente = (
        db.query(models.Usuario).filter(models.Usuario.email == email).first()
    )
    if usuario_existente:
        raise HTTPException(
            status_code=400, detail="El correo ya está registrado"
        )
    errores_contrasena = validar_contrasena(contrasena)
    if errores_contrasena:
        raise HTTPException(
            status_code=400,
            detail="La contraseña no cumple los requisitos de seguridad: "
                   + ", ".join(errores_contrasena) + ".",
        )
    contrasena_encriptada = hash_password(contrasena)
    nuevo_usuario = models.Usuario(
        nombre=nombre,
        apellido_paterno=apellido_paterno,
        apellido_materno=apellido_materno,
        email=email,
        contrasena=contrasena_encriptada,
        email_verificado=False,
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    token = secrets.token_urlsafe(32)
    nuevo_token = models.TokenVerificacion(
        usuario_id=nuevo_usuario.id,
        token_hash=hashlib.sha256(token.encode()).hexdigest(),
        expira_en=datetime.now(timezone.utc) + timedelta(hours=24),  # 24 horas para verificar
    )
    db.add(nuevo_token)
    db.commit()
    enlace = f"{FRONTEND_URL}/verificar-correo?token={token}"
    background_tasks.add_task(
        enviar_correo_verificacion,
        email, nombre, enlace
    )
    return {
        "mensaje": "Usuario registrado. Revisa tu correo electrónico para verificar tu cuenta.",
        "id": nuevo_usuario.id,
    }

def validar_contrasena(password: str):
    """
    Valida que la contraseña cumpla los requisitos de seguridad.
    Devuelve una lista con los mensajes de los requisitos que NO cumple.
    Si la lista viene vacía, la contraseña es válida.
    """
    errores = []

    if len(password) < 8:
        errores.append("mínimo 8 caracteres")

    if not any(c.isupper() for c in password):
        errores.append("al menos una mayúscula")

    if not any(c.islower() for c in password):
        errores.append("al menos una minúscula")

    if not any(c.isdigit() for c in password):
        errores.append("al menos un número")

    if not any(not c.isalnum() for c in password):
        errores.append("al menos un carácter especial (!@#$%...)")

    return errores


# ENDPOINT: Iniciar Sesión


@app.post("/login")
def login(email: str, contrasena: str, db: Session = Depends(get_db)):
    usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.email == email)
        .first()
    )

    if not usuario:
        raise HTTPException(status_code=400, detail="Correo no registrado")

    if not verify_password(contrasena, usuario.contrasena):
        raise HTTPException(status_code=400, detail="Contraseña incorrecta")
    
    if not usuario.activo:
        raise HTTPException(status_code=403, detail="Tu cuenta ha sido bloqueada por un administrador.")

    if not usuario.email_verificado:
        raise HTTPException(
            status_code=403,
            detail="Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.",
        )

    return {
        "mensaje": "Inicio de sesión exitoso",
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "apellido_paterno": usuario.apellido_paterno,
            "apellido_materno": usuario.apellido_materno,
            "email": usuario.email,
            "foto": usuario.foto,
             "rol": usuario.rol, 
        },
    }


# ENDPOINT: Subir / Actualizar Foto de Perfil


@app.post("/perfil/{usuario_id}/foto")
async def subir_foto_perfil(
    usuario_id: int,
    archivo: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if not archivo.content_type or not archivo.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos de imagen")

    extensio = archivo.filename.split(".")[-1] if "." in archivo.filename else "png"
    nombre_foto = f"usuario_{usuario_id}_{uuid.uuid4().hex[:8]}.{extensio}"
    ruta_guardado = os.path.join("uploads", nombre_foto)

    with open(ruta_guardado, "wb") as buffer:
        shutil.copyfileobj(archivo.file, buffer)

    url_foto = f"http://127.0.0.1:8000/uploads/{nombre_foto}"
    usuario.foto = url_foto

    db.commit()
    db.refresh(usuario)

    return {
        "mensaje": "Foto de perfil actualizada correctamente",
        "foto": url_foto,
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "apellido_paterno": usuario.apellido_paterno,
            "apellido_materno": usuario.apellido_materno,
            "email": usuario.email,
            "foto": usuario.foto
        }
    }


@app.post("/perfil/{usuario_id}/password")
def cambiar_contrasena(
    usuario_id: int,
    contrasena: str = Form(...),
    db: Session = Depends(get_db)
):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.contrasena = hash_password(contrasena)
    db.commit()
    return {"mensaje": "Contraseña actualizada correctamente"}


# ENDPOINT: Actualizar datos del perfil


@app.put("/perfil/{usuario_id}")
def actualizar_perfil(
    usuario_id: int,
    nombre: str,
    apellido_paterno: str,
    apellido_materno: str,
    email: str,
    db: Session = Depends(get_db),
):
    usuario = (
        db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    )
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    correo_existente = (
        db.query(models.Usuario)
        .filter(models.Usuario.email == email, models.Usuario.id != usuario_id)
        .first()
    )
    if correo_existente:
        raise HTTPException(status_code=400, detail="El correo ya está en uso")

    usuario.nombre = nombre
    usuario.apellido_paterno = apellido_paterno
    usuario.apellido_materno = apellido_materno
    usuario.email = email

    db.commit()
    db.refresh(usuario)

    return {
        "mensaje": "Perfil actualizado correctamente",
        "usuario": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "apellido_paterno": usuario.apellido_paterno,
            "apellido_materno": usuario.apellido_materno,
            "email": usuario.email,
            "foto": usuario.foto,
        },
    }


# ENDPOINT: Analizar PDF con IA + REGLAS DE BD


@app.post("/api/documentos/analizar")
async def analizar_documento(
    archivo: UploadFile = File(...),
    usuario_id: Optional[int] = Form(None),
    tipo_documento_id: int = Form(...),  
    db: Session = Depends(get_db),
):
    
    if not archivo.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos en formato .pdf")

    contenido = await archivo.read()

    if len(contenido) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="El archivo supera el límite de 10 MB")

    if not contenido.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="El archivo está corrupto o no es un PDF válido")

    nombre_unico = f"{uuid.uuid4()}.pdf"
    ruta_guardado = os.path.join("uploads", "documentos", nombre_unico)
    with open(ruta_guardado, "wb") as f:
        f.write(contenido)

    texto_pdf = ""
    try:
        doc = fitz.open(stream=contenido, filetype="pdf")
        for pagina in doc:
            texto_pdf += pagina.get_text() + "\n--- PÁGINA SIGUIENTE ---\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al leer el PDF: {str(e)}")

    if not texto_pdf.strip():
        raise HTTPException(status_code=400, detail="El PDF no contiene texto legible (puede ser una imagen o escaneo).")

    tipo_doc = db.query(models.TipoDocumento).filter(models.TipoDocumento.id == tipo_documento_id).first()
    
    if not tipo_doc:
        raise HTTPException(status_code=404, detail="El tipo de documento seleccionado no existe en el sistema.")

    reglas_texto_prompt = ""
    if tipo_doc.reglas:
        for r in tipo_doc.reglas:
            obligatorio = "OBLIGATORIA" if r.es_obligatoria else "OPCIONAL / RECOMENDADA"
            reglas_texto_prompt += f"- Cláusula: {r.nombre_clausula} ({obligatorio})\n  Criterio: {r.criterio_evaluacion}\n\n"
    else:
        reglas_texto_prompt = "- Realizar una auditoría general legal de este documento identificando riesgos."

    prompt = f"""
    Eres un abogado corporativo Senior experto en auditoría documental en México.

    TAREA 1: CLASIFICACIÓN
    Determina si el texto corresponde a un/una "{tipo_doc.nombre}". Si es otro tipo de documento (ej. una factura, una receta, un CV), pon "es_documento_correcto": false y explica por qué.

    TEXTO DEL DOCUMENTO A EVALUAR:
    \"\"\"
    {texto_pdf}
    \"\"\"

    REGLAS JURÍDICAS OBLIGATORIAS Y RECOMENDADAS A EVALUAR PARA UN {tipo_doc.nombre.upper()}:
    {reglas_texto_prompt}

    FORMATO DE RESPUESTA EXCLUSIVO (JSON estricto sin markdown ```json):

    SI NO ES UN/UNA {tipo_doc.nombre.upper()}:
    {{
      "es_documento_correcto": false,
      "tipo_detectado": "Tipo de documento detectado (ej. Factura)",
      "motivo": "Por qué no es un {tipo_doc.nombre}."
    }}

    SI SÍ ES UN/UNA {tipo_doc.nombre.upper()}:
    {{
      "es_documento_correcto": true,
      "estado": "Aprobado" o "Atención Requerida" o "Riesgo Alto",
      "puntuacion_riesgo": "Bajo" o "Medio" o "Alto",
      "resumen_ejecutivo": "Resumen profesional de 3 oraciones con el diagnóstico general del documento.",
      "clausulas_detectadas": [
        {{
          "nombre": "Nombre exacto de la cláusula evaluada según las reglas proporcionadas",
          "estado": "Cumple" o "Ausente / Recomendado agregar",
          "proposito": "Explica brevemente para qué sirve legalmente esta cláusula.",
          "observaciones": "Describe qué encontraste o qué falta exactamente en el documento subido.",
          "recomendacion": "Qué debe hacer el usuario para mejorar o corregir esta parte."
        }}
      ]
    }}
    """

    try:
        modelo = genai.GenerativeModel("models/gemini-3.6-flash") # Asegurate de usar "gemini-1.5-flash" si el 3.6 no existe
        respuesta_ia = modelo.generate_content(prompt)
        texto_respuesta = respuesta_ia.text.strip()

        if "```json" in texto_respuesta:
            texto_respuesta = texto_respuesta.split("```json")[1].split("```")[0]
        elif "```" in texto_respuesta:
            texto_respuesta = texto_respuesta.split("```")[1].split("```")[0]

        resultado_json = json.loads(texto_respuesta.strip())

    except Exception as error:
        print(f"🛑 Error de conexión con IA: {error}")
        raise HTTPException(status_code=500, detail=f"Error al analizar el documento con IA: {str(error)}")

    if not resultado_json.get("es_documento_correcto", True):
        tipo_detectado = resultado_json.get("tipo_detectado", "documento no relacionado")
        motivo = resultado_json.get("motivo", "")

        raise HTTPException(
            status_code=400,
            detail=f"No se puede validar el documento: No corresponde a un '{tipo_doc.nombre}' (Se identificó como '{tipo_detectado}'). {motivo}",
        )

    return {
        "mensaje": "Documento analizado con IA exitosamente",
        "archivo": archivo.filename,
        "tipo_documento": tipo_doc.nombre,
        "resultado": resultado_json,
    }


# ENDPOINT: Guardar análisis SOLO cuando se presiona "Aceptar validación"

class GuardarAnalisisRequest(BaseModel):
    usuario_id: int
    nombre_archivo: str
    resultado_ia: dict
    tipo_documento_id: Optional[int] = 1


@app.post("/api/historial/guardar")
def guardar_analisis(body: GuardarAnalisisRequest, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == body.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    nuevo_analisis = models.AnalisisResultado(
        usuario_id=body.usuario_id,
        tipo_documento_id=body.tipo_documento_id or 1,
        nombre_archivo=body.nombre_archivo,
        resultado_ia=body.resultado_ia,
    )
    db.add(nuevo_analisis)
    db.commit()
    db.refresh(nuevo_analisis)

    return {
        "mensaje": "Análisis guardado exitosamente en el historial",
        "analisis_id": nuevo_analisis.id,
    }


# INFORME DETALLADO


class MensajeChat(BaseModel):
    role: str  
    content: str

class ConsultaDocumentoRequest(BaseModel):
    pregunta: str
    resultado_analisis: dict
    nombre_archivo: Optional[str] = None
    tipo_documento_nombre: Optional[str] = "Documento Legal" # 👈 NUEVO: Recibe el nombre del documento
    historial: Optional[List[MensajeChat]] = []

@app.post("/api/documentos/consultar")
async def consultar_documento(body: ConsultaDocumentoRequest):
    pregunta = (body.pregunta or "").strip()
    if not pregunta:
        raise HTTPException(status_code=400, detail="Escribe una pregunta.")

    contexto = json.dumps(body.resultado_analisis, ensure_ascii=False, indent=2)

    historial_texto = ""
    if body.historial:
        for m in body.historial[-8:]:
            quien = "Usuario" if m.role == "user" else "Asistente"
            historial_texto += f"{quien}: {m.content}\n"

    prompt = f"""
Eres el asistente jurídico de DocuVerify. Se acaba de analizar un documento del tipo: {body.tipo_documento_nombre}.
Responde en español, claro y profesional (como en un chat).
No inventes cláusulas que no estén en el INFORME. Si no hay dato, dilo con honestidad.

ARCHIVO: {body.nombre_archivo or "documento.pdf"}

INFORME DE ANÁLISIS (JSON):
{contexto}

HISTORIAL RECIENTE DEL CHAT:
{historial_texto or "(sin historial)"}

PREGUNTA DEL USUARIO:
{pregunta}

Responde SOLO el texto del mensaje (sin JSON, sin markdown de código).
"""

    try:
        modelo = genai.GenerativeModel("models/gemini-3.6-flash")
        respuesta = modelo.generate_content(prompt)
        texto = (respuesta.text or "").strip()
        if not texto:
            raise Exception("Respuesta vacía de la IA")
    except Exception as error:
        print(f"🛑 Error chat IA: {error}")
        raise HTTPException(
            status_code=500,
            detail=f"No se pudo responder la consulta: {str(error)}",
        )

    return {"respuesta": texto}


# ENDPOINT: Obtener Historial del Usuario


@app.get("/api/historial/{usuario_id}")
def obtener_historial(usuario_id: int, db: Session = Depends(get_db)):
    historial = (
        db.query(models.AnalisisResultado)
        .filter(models.AnalisisResultado.usuario_id == usuario_id)
        .order_by(models.AnalisisResultado.fecha_analisis.desc())
        .all()
    )
    
    if not historial:
        return []
        
    return historial

# CONFIGURACIÓN DE CORREO

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "DocuVerify")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

MINUTOS_EXPIRACION_RECUPERACION = 30  # Enlace de recuperación dura 30 min
HORAS_EXPIRACION_VERIFICACION = 24    # Enlace de verificación dura 24 horas

# LÍMITE DE SOLICITUDES

_solicitudes = {}
MAX_SOLICITUDES = 5
VENTANA_SEGUNDOS = 15 * 60  # 15 minutos


def _excede_limite(email: str) -> bool:
    """Devuelve True si ya se enviaron muchos correos a ese email."""
    ahora = time.time()
    recientes = [
        t for t in _solicitudes.get(email, [])
        if ahora - t < VENTANA_SEGUNDOS
    ]
    if len(recientes) >= MAX_SOLICITUDES:
        _solicitudes[email] = recientes
        return True
    recientes.append(ahora)
    _solicitudes[email] = recientes
    return False

# FUNCIONES DE CORREO

def _hash_token(token: str) -> str:
    """Convierte el token en hash SHA-256 para guardarlo en la BD."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def enviar_correo(destinatario: str, asunto: str, texto_plano: str, html: str):
    """
    Envía un correo electrónico.
    - MODO PRUEBA (SMTP_USER vacío): imprime en la consola.
    - MODO REAL: envía el correo por SMTP.
    Funciona para CUALQUIER correo: Gmail, Outlook, Hotmail, Yahoo, etc.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print("\n" + "=" * 60)
        print(f"📧 [MODO PRUEBA] {asunto}")
        print(f"   Para: {destinatario}")
        print(f"   Contenido: {texto_plano[:200]}...")
        print("=" * 60 + "\n")
        return

    mensaje = EmailMessage()
    mensaje["Subject"] = asunto
    mensaje["From"] = f"{SMTP_FROM_NAME} <{SMTP_USER}>"
    mensaje["To"] = destinatario
    mensaje.set_content(texto_plano)
    mensaje.add_alternative(html, subtype="html")

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as servidor:
            servidor.starttls()  # Conexión cifrada
            servidor.login(SMTP_USER, SMTP_PASSWORD)
            servidor.send_message(mensaje)
        print(f"✅ Correo enviado: '{asunto}' → {destinatario}")
    except Exception as e:
        print(f"🛑 Error al enviar correo a {destinatario}: {e}")


def enviar_correo_verificacion(email: str, nombre: str, enlace: str):
    """Envía el correo para verificar que el email es real."""
    texto = (
        f"Hola {nombre},\n\n"
        f"Gracias por registrarte en DocuVerify.\n"
        f"Para activar tu cuenta, abre este enlace:\n\n{enlace}\n\n"
        f"Si no te registraste en DocuVerify, ignora este mensaje.\n\nDocuVerify"
    )
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:20px;">
      <h2 style="color:#2563eb;">DocuVerify</h2>
      <p>Hola <b>{nombre}</b>,</p>
      <p>Gracias por registrarte. Para activar tu cuenta, verifica tu correo electrónico.</p>
      <p style="text-align:center;margin:30px 0;">
        <a href="{enlace}" style="background:#2563eb;color:white;padding:14px 28px;
           border-radius:10px;text-decoration:none;font-weight:bold;">
          Verificar mi correo
        </a>
      </p>
      <p style="color:#64748b;font-size:13px;">
        Este enlace caduca en {HORAS_EXPIRACION_VERIFICACION} horas.
        Si no te registraste, ignora este mensaje.
      </p>
    </div>
    """
    enviar_correo(email, "Verifica tu correo - DocuVerify", texto, html)


def enviar_correo_recuperacion(email: str, nombre: str, enlace: str):
    """Envía el correo para recuperar la contraseña."""
    texto = (
        f"Hola {nombre},\n\n"
        f"Recibimos una solicitud para restablecer tu contraseña.\n"
        f"Abre este enlace (válido por {MINUTOS_EXPIRACION_RECUPERACION} minutos):\n\n{enlace}\n\n"
        f"Si no fuiste tú, ignora este correo.\n\nDocuVerify"
    )
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:20px;">
      <h2 style="color:#2563eb;">DocuVerify</h2>
      <p>Hola <b>{nombre}</b>,</p>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p style="text-align:center;margin:30px 0;">
        <a href="{enlace}" style="background:#2563eb;color:white;padding:14px 28px;
           border-radius:10px;text-decoration:none;font-weight:bold;">
          Restablecer contraseña
        </a>
      </p>
      <p style="color:#64748b;font-size:13px;">
        Este enlace caduca en {MINUTOS_EXPIRACION_RECUPERACION} minutos.
        Si no solicitaste esto, ignora este correo.
      </p>
    </div>
    """
    enviar_correo(email, "Recupera tu contraseña - DocuVerify", texto, html)

# MODELOS DE DATOS PARA LOS ENDPOINTS NUEVOS

class SolicitudRecuperacion(BaseModel):
    email: str


class RestablecerRequest(BaseModel):
    token: str
    nueva_contrasena: str


class ReenviarVerificacionRequest(BaseModel):
    email: str


# ENDPOINT: Verificar correo


@app.get("/verificar-correo")
def verificar_correo(token: str, db: Session = Depends(get_db)):
    registro = (
        db.query(models.TokenVerificacion)
        .filter(models.TokenVerificacion.token_hash == _hash_token(token))
        .first()
    )

    if not registro:
         raise HTTPException(status_code=400, detail="El enlace no es válido.")

    if registro.expira_en < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="El enlace ha expirado.")

    usuario = db.query(models.Usuario).filter(models.Usuario.id == registro.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if registro.usado:
        if usuario.email_verificado:
            return {"mensaje": "Tu correo ya fue verificado anteriormente. Ya puedes iniciar sesión."}
        else:
            raise HTTPException(status_code=400, detail="Este enlace ya fue utilizado.")

    usuario.email_verificado = True
    registro.usado = True
    db.commit()

    return {"mensaje": "Correo verificado correctamente. Ya puedes iniciar sesión."}


# ENDPOINT: Reenviar correo de verificación

@app.post("/reenviar-verificacion")
def reenviar_verificacion(
    body: ReenviarVerificacionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    email = body.email.strip().lower()

    respuesta = {
        "mensaje": "Si el correo está registrado y sin verificar, recibirás un nuevo enlace."
    }

    if _excede_limite(email):
        raise HTTPException(
            status_code=429,
            detail="Demasiadas solicitudes. Intenta más tarde.",
        )

    usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.email.ilike(email))
        .first()
    )
    if not usuario or usuario.email_verificado:
        return respuesta

    db.query(models.TokenVerificacion).filter(
        models.TokenVerificacion.usuario_id == usuario.id,
        models.TokenVerificacion.usado == False,  # noqa: E712
    ).update({"usado": True})

    token = secrets.token_urlsafe(32)
    nuevo_token = models.TokenVerificacion(
        usuario_id=usuario.id,
        token_hash=_hash_token(token),
        expira_en=datetime.now(timezone.utc) + timedelta(hours=HORAS_EXPIRACION_VERIFICACION),
    )
    db.add(nuevo_token)
    db.commit()

    enlace = f"{FRONTEND_URL}/verificar-correo?token={token}"
    background_tasks.add_task(
        enviar_correo_verificacion, usuario.email, usuario.nombre, enlace
    )

    return respuesta


# ENDPOINT: Solicitar recuperación de contraseña


@app.post("/recuperar-contrasena")
def solicitar_recuperacion(
    body: SolicitudRecuperacion,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    email = body.email.strip().lower()

    respuesta = {
        "mensaje": "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
    }

    if _excede_limite(email):
        raise HTTPException(
            status_code=429,
            detail="Demasiadas solicitudes. Intenta más tarde.",
        )

    usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.email.ilike(email))
        .first()
    )
    if not usuario:
        return respuesta

    db.query(models.TokenRecuperacion).filter(
        models.TokenRecuperacion.usuario_id == usuario.id,
        models.TokenRecuperacion.usado == False,  # noqa: E712
    ).update({"usado": True})

    token = secrets.token_urlsafe(32)
    nuevo_token = models.TokenRecuperacion(
        usuario_id=usuario.id,
        token_hash=_hash_token(token),
        expira_en=datetime.now(timezone.utc) + timedelta(minutes=MINUTOS_EXPIRACION_RECUPERACION),
    )
    db.add(nuevo_token)
    db.commit()

    enlace = f"{FRONTEND_URL}/restablecer-contrasena?token={token}"
    background_tasks.add_task(
        enviar_correo_recuperacion, usuario.email, usuario.nombre, enlace
    )

    return respuesta


# ENDPOINT: Restablecer contraseña con el token


@app.post("/restablecer-contrasena")
def restablecer_contrasena(body: RestablecerRequest, db: Session = Depends(get_db)):
    errores_contrasena = validar_contrasena(body.nueva_contrasena)
    if errores_contrasena:
        raise HTTPException(
            status_code=400,
            detail="La contraseña no cumple los requisitos de seguridad: "
                   + ", ".join(errores_contrasena) + ".",
        )

    registro = (
        db.query(models.TokenRecuperacion)
        .filter(models.TokenRecuperacion.token_hash == _hash_token(body.token))
        .first()
    )

    if (not registro or registro.usado
            or registro.expira_en < datetime.now(timezone.utc)):
        raise HTTPException(
            status_code=400,
            detail="El enlace no es válido o ya expiró. Solicita uno nuevo.",
        )

    usuario = db.query(models.Usuario).filter(
        models.Usuario.id == registro.usuario_id
    ).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.contrasena = hash_password(body.nueva_contrasena)
    usuario.email_verificado = True
    registro.usado = True
    db.commit()

    return {"mensaje": "Contraseña restablecida correctamente. Ya puedes iniciar sesión."}


# ENDPOINT: Obtener tipos de documento


@app.get("/api/tipos-documento")
def obtener_tipos_documento_publico(db: Session = Depends(get_db)):
    # Solo trae los que están activos
    tipos = db.query(models.TipoDocumento).filter(models.TipoDocumento.activo == True).all()
    return [{"id": t.id, "nombre": t.nombre, "descripcion": t.descripcion} for t in tipos]


# EXCLUSIV0 PARA ADMINISTRADORES

def verificar_es_admin(admin_id: int, db: Session):
    """Función de seguridad: Verifica que el usuario que pide los datos sea realmente un Admin"""
    usuario = db.query(models.Usuario).filter(models.Usuario.id == admin_id).first()
    if not usuario or usuario.rol != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado. Permisos insuficientes.")
    return usuario

# 1. Obtener Estadísticas (COMPLETO CON 5 GRÁFICAS)

@app.get("/api/admin/estadisticas")
def obtener_estadisticas_admin(admin_id: int, db: Session = Depends(get_db)):
    verificar_es_admin(admin_id, db)

    total_usuarios = db.query(models.Usuario).count()
    usuarios_verificados = db.query(models.Usuario).filter(models.Usuario.email_verificado == True).count()
    usuarios_no_verificados = total_usuarios - usuarios_verificados
    total_reglas = db.query(models.ReglaJuridica).count()
    
    tipos_doc = db.query(models.TipoDocumento).all()
    total_tipos_documento = len(tipos_doc)
    mapa_tipos = {t.id: t.nombre for t in tipos_doc} 

    todos_analisis = db.query(models.AnalisisResultado).all()
    total_analisis = len(todos_analisis)
    
    meses_nombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    analisis_por_mes = {mes: 0 for mes in meses_nombres}
    riesgos = {"Aprobado": 0, "Atención Requerida": 0, "Riesgo Alto": 0, "No clasificado": 0}
    clausulas_ausentes = {}
    
    analisis_por_tipo = {}
    
    for a in todos_analisis:
        tipo_id = getattr(a, 'tipo_documento_id', 1) or 1
        nombre_tipo = mapa_tipos.get(tipo_id, "Otro / General")
        analisis_por_tipo[nombre_tipo] = analisis_por_tipo.get(nombre_tipo, 0) + 1

        if a.fecha_analisis:
            mes_nombre = meses_nombres[a.fecha_analisis.month - 1]
            analisis_por_mes[mes_nombre] += 1
            
        if a.resultado_ia and isinstance(a.resultado_ia, dict):
            estado = a.resultado_ia.get("estado", "No clasificado")
            if estado in riesgos:
                riesgos[estado] += 1
            else:
                riesgos["No clasificado"] += 1

            clausulas = a.resultado_ia.get("clausulas_detectadas", [])
            if isinstance(clausulas, list):
                for c in clausulas:
                    if isinstance(c, dict) and c.get("estado") == "Ausente / Recomendado agregar":
                        nombre_c = c.get("nombre", "Otra")
                        if len(nombre_c) > 30: # Acortamos textos muy largos
                            nombre_c = nombre_c[:30] + "..."
                        clausulas_ausentes[nombre_c] = clausulas_ausentes.get(nombre_c, 0) + 1

    top_clausulas = sorted(clausulas_ausentes.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "total_usuarios": total_usuarios,
        "usuarios_verificados": usuarios_verificados,
        "usuarios_no_verificados": usuarios_no_verificados,
        "total_analisis": total_analisis,
        "total_reglas": total_reglas,
        "total_tipos_documento": total_tipos_documento,
        
        "grafico_meses": list(analisis_por_mes.keys()),
        "grafico_valores": list(analisis_por_mes.values()),
        
        "grafico_riesgos_labels": list(riesgos.keys()),
        "grafico_riesgos_valores": list(riesgos.values()),
        
        "grafico_clausulas_labels": [c[0] for c in top_clausulas],
        "grafico_clausulas_valores": [c[1] for c in top_clausulas],
        
        "grafico_tipos_labels": list(analisis_por_tipo.keys()),
        "grafico_tipos_valores": list(analisis_por_tipo.values()),
    }

# 2. Obtener la lista de TODOS los usuarios

@app.get("/api/admin/usuarios")
def obtener_todos_los_usuarios(admin_id: int, db: Session = Depends(get_db)):
    verificar_es_admin(admin_id, db)
    
    usuarios = db.query(models.Usuario).all()
    lista_segura = []
    for u in usuarios:
        lista_segura.append({
            "id": u.id,
            "nombre": u.nombre,
            "apellidos": f"{u.apellido_paterno} {u.apellido_materno or ''}".strip(),
            "email": u.email,
            "rol": u.rol,
            "email_verificado": u.email_verificado,
            "activo": u.activo
        })
    return lista_segura

# 3. Cambiar el rol de un usuario

@app.put("/api/admin/usuarios/{usuario_target_id}/rol")
def cambiar_rol_usuario(
    usuario_target_id: int, 
    nuevo_rol: str, 
    admin_id: int, 
    db: Session = Depends(get_db)
):
    verificar_es_admin(admin_id, db)
    
    if usuario_target_id == admin_id:
        raise HTTPException(status_code=400, detail="No puedes cambiar tu propio rol por seguridad.")
        
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_target_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        
    usuario.rol = nuevo_rol
    db.commit()
    return {"mensaje": f"Rol actualizado a {nuevo_rol} exitosamente."}

# 4. Eliminar un usuario permanentemente

@app.delete("/api/admin/usuarios/{usuario_target_id}")
def eliminar_usuario(usuario_target_id: int, admin_id: int, db: Session = Depends(get_db)):
    verificar_es_admin(admin_id, db)
    
    if usuario_target_id == admin_id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta desde aquí.")
        
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_target_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        
    db.delete(usuario)
    db.commit()
    return {"mensaje": "Usuario eliminado permanentemente del sistema."}

# 5. Bloquear o Desbloquear un usuario

@app.put("/api/admin/usuarios/{usuario_target_id}/estado")
def cambiar_estado_usuario(
    usuario_target_id: int, 
    activo: bool, 
    admin_id: int, 
    db: Session = Depends(get_db)
):
    verificar_es_admin(admin_id, db)
    
    if usuario_target_id == admin_id:
        raise HTTPException(status_code=400, detail="No puedes bloquear tu propia cuenta.")
        
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_target_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        
    usuario.activo = activo
    db.commit()
    
    estado_texto = "activado" if activo else "bloqueado"
    return {"mensaje": f"Usuario {estado_texto} exitosamente."}

# 6. Historial Global de Análisis

@app.get("/api/admin/historial-global")
def obtener_historial_global(admin_id: int, db: Session = Depends(get_db)):
    verificar_es_admin(admin_id, db)
    
    todos_analisis = db.query(models.AnalisisResultado).order_by(models.AnalisisResultado.fecha_analisis.desc()).all()
    
    lista_segura = []
    for a in todos_analisis:
        usuario = db.query(models.Usuario).filter(models.Usuario.id == a.usuario_id).first()
        email_usuario = usuario.email if usuario else "Usuario eliminado"
        
        resultado = a.resultado_ia if a.resultado_ia else {}
        estado = resultado.get("estado", "Desconocido")
        riesgo = resultado.get("puntuacion_riesgo", "Desconocido")
        
        lista_segura.append({
            "id": a.id,
            "nombre_archivo": a.nombre_archivo,
            "email_usuario": email_usuario,
            "fecha_analisis": a.fecha_analisis.strftime("%Y-%m-%d %H:%M") if a.fecha_analisis else "N/A",
            "estado": estado,
            "riesgo": riesgo
        })
        
    return lista_segura

# 7. Obtener todos los tipos de documento

@app.get("/api/admin/tipos-documento")
def obtener_tipos_documento(admin_id: int, db: Session = Depends(get_db)):
    verificar_es_admin(admin_id, db)
    tipos = db.query(models.TipoDocumento).all()
    return [{
        "id": t.id,
        "nombre": t.nombre,
        "descripcion": t.descripcion,
        "activo": t.activo
    } for t in tipos]

# 8. Crear nuevo tipo de documento

@app.post("/api/admin/tipos-documento")
def crear_tipo_documento(
    nombre: str,
    descripcion: str,
    admin_id: int,
    db: Session = Depends(get_db)
):
    verificar_es_admin(admin_id, db)
    
    existente = db.query(models.TipoDocumento).filter(
        models.TipoDocumento.nombre == nombre
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un tipo de documento con ese nombre")
    
    nuevo_tipo = models.TipoDocumento(
        nombre=nombre,
        descripcion=descripcion,
        activo=True
    )
    db.add(nuevo_tipo)
    db.commit()
    db.refresh(nuevo_tipo)
    
    return {"mensaje": "Tipo de documento creado exitosamente", "id": nuevo_tipo.id}

# 9. Obtener todas las reglas jurídicas

@app.get("/api/admin/reglas")
def obtener_reglas(admin_id: int, tipo_documento_id: int = None, db: Session = Depends(get_db)):
    verificar_es_admin(admin_id, db)
    
    query = db.query(models.ReglaJuridica)
    if tipo_documento_id:
        query = query.filter(models.ReglaJuridica.tipo_documento_id == tipo_documento_id)
    
    reglas = query.all()
    
    return [{
        "id": r.id,
        "tipo_documento_id": r.tipo_documento_id,
        "nombre_clausula": r.nombre_clausula,
        "es_obligatoria": r.es_obligatoria,
        "criterio_evaluacion": r.criterio_evaluacion,
        "creado_en": r.creado_en.strftime("%Y-%m-%d") if r.creado_en else "N/A"
    } for r in reglas]

# 10. Crear nueva regla jurídica

@app.post("/api/admin/reglas")
def crear_regla(
    tipo_documento_id: int,
    nombre_clausula: str,
    criterio_evaluacion: str,
    es_obligatoria: bool = True,
    admin_id: int = None,
    db: Session = Depends(get_db)
):
    # Verificar admin
    if admin_id:
        verificar_es_admin(admin_id, db)
    
    tipo_doc = db.query(models.TipoDocumento).filter(
        models.TipoDocumento.id == tipo_documento_id
    ).first()
    if not tipo_doc:
        raise HTTPException(status_code=404, detail="Tipo de documento no encontrado")
    
    nueva_regla = models.ReglaJuridica(
        tipo_documento_id=tipo_documento_id,
        nombre_clausula=nombre_clausula,
        criterio_evaluacion=criterio_evaluacion,
        es_obligatoria=es_obligatoria
    )
    db.add(nueva_regla)
    db.commit()
    db.refresh(nueva_regla)
    
    return {"mensaje": "Regla jurídica creada exitosamente", "id": nueva_regla.id}

# 11. Editar regla jurídica existente

@app.put("/api/admin/reglas/{regla_id}")
def editar_regla(
    regla_id: int,
    nombre_clausula: str,
    criterio_evaluacion: str,
    es_obligatoria: bool,
    admin_id: int,
    db: Session = Depends(get_db)
):
    verificar_es_admin(admin_id, db)
    
    regla = db.query(models.ReglaJuridica).filter(
        models.ReglaJuridica.id == regla_id
    ).first()
    if not regla:
        raise HTTPException(status_code=404, detail="Regla no encontrada")
    
    regla.nombre_clausula = nombre_clausula
    regla.criterio_evaluacion = criterio_evaluacion
    regla.es_obligatoria = es_obligatoria
    
    db.commit()
    return {"mensaje": "Regla actualizada exitosamente"}

# 12. Eliminar regla jurídica

@app.delete("/api/admin/reglas/{regla_id}")
def eliminar_regla(regla_id: int, admin_id: int, db: Session = Depends(get_db)):
    verificar_es_admin(admin_id, db)
    
    regla = db.query(models.ReglaJuridica).filter(
        models.ReglaJuridica.id == regla_id
    ).first()
    if not regla:
        raise HTTPException(status_code=404, detail="Regla no encontrada")
    
    db.delete(regla)
    db.commit()
    return {"mensaje": "Regla eliminada exitosamente"}
