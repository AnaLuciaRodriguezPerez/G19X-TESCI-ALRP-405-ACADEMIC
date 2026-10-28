import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Lock, Eye, EyeOff, CheckCircle, ArrowRight, Check, X } from 'lucide-react';
import api from '../api';


// Crear nueva contraseña


function RestablecerContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

 
  // Requisitos evaluados en tiempo real sobre "nueva"


  const requisitos = [
    { texto: 'Mínimo 8 caracteres', cumple: nueva.length >= 8 },
    { texto: 'Una letra mayúscula (A-Z)', cumple: /[A-Z]/.test(nueva) },
    { texto: 'Una letra minúscula (a-z)', cumple: /[a-z]/.test(nueva) },
    { texto: 'Un número (0-9)', cumple: /[0-9]/.test(nueva) },
    { texto: 'Un carácter especial (!@#$%...)', cumple: /[^A-Za-z0-9]/.test(nueva) },
  ];

  const requisitosValida = requisitos.every((req) => req.cumple);
  const requisitosCumplidos = requisitos.filter((req) => req.cumple).length;

  const nivelFortaleza = () => {
    if (nueva.length === 0) return { texto: '', color: 'bg-transparent', ancho: '0%' };
    if (requisitosCumplidos <= 2) return { texto: 'Débil', color: 'bg-red-500', ancho: '33%' };
    if (requisitosCumplidos <= 4) return { texto: 'Media', color: 'bg-yellow-500', ancho: '66%' };
    return { texto: 'Fuerte', color: 'bg-green-500', ancho: '100%' };
  };

  const fortaleza = nivelFortaleza();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nueva || !confirmar) {
      setError('Completa ambos campos.');
      return;
    }

    if (nueva.length < 8 || !requisitosValida) {
      setError('La contraseña debe cumplir todos los requisitos de seguridad.');
      return;
    }

    if (nueva !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {

      setCargando(true);
      const respuesta = await api.post('/restablecer-contrasena', {
        token,
        nueva_contrasena: nueva,
      });
      setExito(respuesta.data.mensaje);

    } catch (err) {

      if (err.response && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setCargando(false);
    }
  };

  const inputClase =
    'w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-sm';

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 font-sans text-slate-900 p-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-4xl font-black text-slate-900 mb-2">Nueva contraseña</h2>
          <p className="text-slate-500 text-lg">Escribe tu nueva contraseña.</p>
        </div>

        {!token ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-4 rounded-xl font-bold text-center">
            Enlace inválido. Solicita uno nuevo.
          </div>
        ) : exito ? (
          <div className="space-y-5">
            <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-5 rounded-xl flex gap-3">
              <CheckCircle size={24} className="shrink-0" />
              <p className="font-bold">{exito}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 text-lg"
            >
              Ir a iniciar sesión <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Nueva contraseña */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nueva contraseña</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres con mayúscula, número y símbolo"
                  value={nueva}
                  onChange={(e) => setNueva(e.target.value)}
                  className={inputClase}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Barra de fortaleza de la contraseña */}
              {nueva.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500">Seguridad</span>
                    <span className={`text-xs font-black ${fortaleza.texto === 'Fuerte' ? 'text-green-600' : fortaleza.texto === 'Media' ? 'text-yellow-600' : 'text-red-500'}`}>
                      {fortaleza.texto}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${fortaleza.color} transition-all duration-300 rounded-full`} style={{ width: fortaleza.ancho }}></div>
                  </div>
                </div>
              )}

              <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-slate-600 mb-2">Tu contraseña debe contener:</p>
                <ul className="space-y-1">
                  {requisitos.map((req, index) => (
                    <li key={index} className={`flex items-center gap-2 text-xs font-semibold transition-colors ${req.cumple ? 'text-green-600' : 'text-slate-400'}`}>
                      {req.cumple ? <Check size={14} className="shrink-0" /> : <X size={14} className="shrink-0" />}
                      {req.texto}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar contraseña</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Repite la contraseña"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  className={inputClase}
                />
              </div>

              {confirmar.length > 0 && nueva !== confirmar && (
                <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <X size={14} /> Las contraseñas no coinciden
                </p>
              )}
              {confirmar.length > 0 && nueva === confirmar && (
                <p className="mt-1.5 text-xs font-semibold text-green-600 flex items-center gap-1.5">
                  <Check size={14} /> Las contraseñas coinciden
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default RestablecerContrasena;