import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

function RestablecerContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nueva.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nueva !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const respuesta = await axios.post('http://127.0.0.1:8000/restablecer-contrasena', {
        token,
        nueva_contrasena: nueva,
      });
      setExito(respuesta.data.mensaje);
    } catch (err) {
      setError('No se pudo restablecer la contraseña.');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 font-sans text-slate-900 p-8">
      <div className="w-full max-w-md">
        <h2 className="text-4xl font-black text-slate-900 mb-6">Nueva contraseña</h2>
        {exito ? (
          <p>{exito}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Nueva contraseña"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              className="w-full p-3 border rounded-xl"
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="w-full p-3 border rounded-xl"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">
              Cambiar contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default RestablecerContrasena;