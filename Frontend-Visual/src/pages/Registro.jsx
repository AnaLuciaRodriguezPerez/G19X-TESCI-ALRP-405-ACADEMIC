import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

import logo from '../assets/logo.png';

function Registro() {
  const navigate = useNavigate();

  // Visibilidad de contraseñas
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  // Estados de UI
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarModalExito, setMostrarModalExito] = useState(false); // Modal de éxito

  // ============================================
  // FUNCIÓN PARA REGISTRAR USUARIO
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validar campos vacíos
    if (!nombre || !apellidoPaterno || !email || !contrasena || !confirmarContrasena) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    // 2. Validar que las contraseñas coincidan
    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // 3. Validar longitud mínima de contraseña
    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setCargando(true);

      // 4. Enviar datos al backend (se guardan en PostgreSQL)
      await axios.post('http://127.0.0.1:8000/registro', null, {
        params: {
          nombre,
          apellido_paterno: apellidoPaterno,
          apellido_materno: apellidoMaterno || '', // Opcional
          email,
          contrasena,
        },
      });

      // 5. Mostrar modal de éxito
      setMostrarModalExito(true);

    } catch (err) {
      if (err.response && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('No se pudo conectar con el servidor. Intenta de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  };

  // Función al dar clic en "Aceptar" dentro del modal
  const handleAceptarExito = () => {
    setMostrarModalExito(false);
    navigate('/'); // Redirige al login
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 relative">

      {/* ================= LADO IZQUIERDO ================= */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden flex-col justify-between p-16 text-white">
        
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="bg-white rounded-full mb-4 shadow-lg border-4 border-blue-500 overflow-hidden w-24 h-24 flex items-center justify-center">
                <img src={logo} alt="Logo DocuVerify" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">DocuVerify</h1>
              <p className="text-xs text-blue-200 tracking-widest uppercase font-bold">
                Validación Documental
              </p>
            </div>
          </div>

          <h2 className="text-5xl font-black leading-tight mb-6">
            Crea tu<br />
            <span className="text-blue-400">cuenta</span>
          </h2>

          <p className="text-lg text-slate-300 leading-relaxed max-w-md border-l-4 border-blue-500 pl-6">
            Regístrate para acceder al sistema de validación documental
            con reglas jurídicas e Inteligencia Artificial.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-slate-500">
            DocuVerify © 2026 · Sistema de Validación Documental
          </p>
        </div>
      </div>

      {/* ================= LADO DERECHO: FORMULARIO ================= */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">

          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              Registrarse
            </h2>
            <p className="text-slate-500 text-base md:text-lg">
              Completa tus datos para crear una cuenta
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* NOMBRE */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nombre
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* APELLIDOS (2 columnas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Apellido Paterno
                </label>
                <input
                  type="text"
                  placeholder="Apellido paterno"
                  value={apellidoPaterno}
                  onChange={(e) => setApellidoPaterno(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  placeholder="Apellido materno"
                  value={apellidoMaterno}
                  onChange={(e) => setApellidoMaterno(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* CORREO */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* CONTRASEÑA */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Crea una contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CONFIRMAR CONTRASEÑA */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* MENSAJE DE ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}

            {/* BOTÓN REGISTRAR */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
              {!cargando && <ArrowRight size={20} />}
            </button>
          </form>

          {/* Volver a login */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/" className="text-blue-600 font-bold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* ============================================ */}
      {/* MODAL DE ÉXITO AL REGISTRAR */}
      {/* ============================================ */}
      {mostrarModalExito && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          
          {/* Fondo obscuro */}
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"></div>

          {/* Tarjeta emergente */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 text-slate-900 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">

              {/* Icono de éxito */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                <CheckCircle size={36} className="text-green-600" />
              </div>

              <h3 className="text-2xl font-black mb-2">¡Cuenta creada!</h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Tu usuario ha sido registrado exitosamente en el sistema. Ya puedes iniciar sesión.
              </p>

              {/* Botón Aceptar */}
              <button
                onClick={handleAceptarExito}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all text-lg"
              >
                Aceptar
              </button>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default Registro;