import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

function Login() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !contrasena) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
      setCargando(true);

      const respuesta = await api.post('/login', null, { 
        params: { email, contrasena },
      });

      const datosUsuario = respuesta.data.usuario;
      localStorage.setItem('token', respuesta.data.access_token); 
      localStorage.setItem('usuario', JSON.stringify(datosUsuario));

      if (datosUsuario.rol === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/inicio');
      }

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
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900">
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
              <p className="text-xs text-blue-200 tracking-widest uppercase font-bold">Validación Documental</p>
            </div>
          </div>
          <h2 className="text-5xl font-black leading-tight mb-6">Sistema de<br /><span className="text-blue-400">Validación</span></h2>
          <p className="text-lg text-slate-300 leading-relaxed max-w-md border-l-4 border-blue-500 pl-6">
            Usa reglas jurídicas e Inteligencia Artificial para revisar acuerdos, identificar inconsistencias y validar documentos con precisión.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-sm text-slate-500">DocuVerify © 2026 · Sistema de Validación Documental</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 mb-2">Entrar</h2>
            <p className="text-slate-500 text-lg">Inicia sesión con tu correo y contraseña</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Correo</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={20} />
                </div>
                <input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={20} />
                </div>
                <input type={showPass ? 'text' : 'password'} placeholder="Tu contraseña" value={contrasena} onChange={(e) => setContrasena(e.target.value)} className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}

            {error.includes('verificar') && (
              <button type="button" onClick={async () => {
                  try {
                    const r = await api.post('/reenviar-verificacion', { email }); 
                    alert(r.data.mensaje);
                  } catch (err) { alert('No se pudo reenviar el correo.'); }
                }} className="text-sm text-blue-600 font-semibold hover:underline">
                Reenviar correo de verificación
              </button>
            )}

            <div className="flex justify-end">
              <button type="button" onClick={() => navigate('/olvide-contrasena')} className="text-sm text-blue-600 font-semibold hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" disabled={cargando} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {cargando ? 'Verificando...' : 'Iniciar Sesion'}
              {!cargando && <ArrowRight size={20} />}
            </button>

            <button type="button" onClick={() => navigate('/registro')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 text-lg">
              Registrarse <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;