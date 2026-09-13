from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido_paterno = Column(String(100), nullable=False)
    apellido_materno = Column(String(100))
    email = Column(String(150), unique=True, index=True, nullable=False)
    contrasena = Column(String(255), nullable=False)
    foto = Column(String(255))

class TipoDocumento(Base):
    __tablename__ = "tipos_documento"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text)
    activo = Column(Boolean, default=True)

    reglas = relationship("ReglaJuridica", back_populates="tipo_documento")

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

    tipo_documento = relationship("TipoDocumento", back_populates="reglas")