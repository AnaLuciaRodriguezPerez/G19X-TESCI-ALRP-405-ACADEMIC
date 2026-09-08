from database import Base
from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


# 1. Modelo de Usuarios (El que ya tenías)
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido_paterno = Column(String(100), nullable=False)
    apellido_materno = Column(String(100))
    email = Column(String(150), unique=True, index=True, nullable=False)
    contrasena = Column(String(255), nullable=False)
    foto = Column(String(255))

    # Relación: Un usuario puede tener muchos análisis guardados
    analisis = relationship("AnalisisResultado", back_populates="usuario")


# 2. Modelo de Tipos de Documento (NDA, Servicios, etc.)
class TipoDocumento(Base):
    __tablename__ = "tipos_documento"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text)
    activo = Column(Boolean, default=True)

    # Relaciones
    reglas = relationship("ReglaJuridica", back_populates="tipo_documento")
    analisis = relationship("AnalisisResultado", back_populates="tipo_documento")


# 3. Modelo de Reglas Jurídicas por Documento
class ReglaJuridica(Base):
    __tablename__ = "reglas_juridicas"

    id = Column(Integer, primary_key=True, index=True)
    tipo_documento_id = Column(
        Integer, ForeignKey("tipos_documento.id", ondelete="CASCADE"), nullable=False
    )
    nombre_clausula = Column(String(150), nullable=False)
    es_obligatoria = Column(Boolean, default=True)
    criterio_evaluacion = Column(Text, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())

    # Relación de regreso con TipoDocumento
    tipo_documento = relationship("TipoDocumento", back_populates="reglas")


# 4. Modelo de Resultados del Análisis con la IA
class AnalisisResultado(Base):
    __tablename__ = "analisis_resultados"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(
        Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True
    )
    tipo_documento_id = Column(
        Integer, ForeignKey("tipos_documento.id"), nullable=True
    )
    nombre_archivo = Column(String(255), nullable=False)
    resultado_ia = Column(
        JSON, nullable=False
    )  # Almacena el dictamen JSON que devuelve Gemini
    fecha_analisis = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones de regreso
    usuario = relationship("Usuario", back_populates="analisis")
    tipo_documento = relationship("TipoDocumento", back_populates="analisis")