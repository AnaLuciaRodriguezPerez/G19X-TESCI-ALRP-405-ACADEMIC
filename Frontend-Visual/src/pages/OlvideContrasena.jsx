import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import api from '../api';


function OlvideContrasena() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!email) {
      setError('Por favor, escribe tu correo.');
      return;
    }

    try {
      setCargando(true);
      const respuesta = await api.post('/recuperar-contrasena', { email });
      setMensaje(respuesta.data.mensaje);
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

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 font-sans text-slate-900 p-8">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold mb-8"
        >
          <ArrowLeft size={18} /> Volver a iniciar sesión
        </button>

        <div className="mb-8">
          <h2 className="text-4xl font-black text-slate-900 mb-2">Recuperar contraseña</h2>
          <p className="text-slate-500 text-lg">
            Escribe tu correo y te enviaremos un enlace para crear una nueva contraseña.
          </p>
        </div>

        {mensaje ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-5 rounded-xl flex gap-3">
            <CheckCircle size={24} className="shrink-0" />
            <div>
              <p className="font-bold">{mensaje}</p>
              <p className="text-sm mt-1">Revisa también tu carpeta de spam.</p>
            </div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Correo</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-sm"
                />
              </div>
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
              {cargando ? 'Enviando...' : 'Enviar enlace'}
              {!cargando && <Send size={20} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OlvideContrasena;