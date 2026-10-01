import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function OlvideContrasena() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Ingresa tu correo');

    try {
      const respuesta = await axios.post('http://127.0.0.1:8000/recuperar-contrasena', { email });
      setMensaje(respuesta.data.mensaje);
    } catch (err) {
      setError('Error al enviar el correo');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-4">Recuperar contraseña</h2>
        {mensaje ? (
          <p className="text-green-600">{mensaje}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-xl"
            />
            {error && <p className="text-red-500">{error}</p>}
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl">
              Enviar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OlvideContrasena;