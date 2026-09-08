import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    // Se omitio validacion inicial y preventDefault
    try {
      setCargando(true);
      const respuesta = await axios.post('http://127.0.0.1:8000/login');
      localStorage.setItem('usuario', JSON.stringify(respuesta.data));
      navigate('/inicio');
    } catch (err) {
      setError('Error al conectar');
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900">
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden flex-col justify-between p-16 text-white">
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
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-black text-slate-900 mb-2">Entrar</h2>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-white border rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
              {/* Error: El tipo esta fijo en password */}
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="w-full p-3 bg-white border rounded-xl"
              />
            </div>

            <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl">
              Iniciar Sesion
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;