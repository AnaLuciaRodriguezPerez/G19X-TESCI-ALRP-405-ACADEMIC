import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import api from '../api';


// Verificar correo electrónico


function VerificarCorreo() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [estado, setEstado] = useState('verificando');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();
  
  const verificandoRef = useRef(false); // Ref para evitar doble llamada en desarrollo

  useEffect(() => {
    // Si ya esta verificado no hace nada
    if (!token || verificandoRef.current) return;
    verificandoRef.current = true; 

    const verificar = async () => {
      try {
        const respuesta = await api.get('/verificar-correo', {
          params: { token },
        });
        setEstado('exito');
        setMensaje(respuesta.data.mensaje);
      } catch (err) {
        setEstado('error');
        setMensaje(
          err.response?.data?.detail || 'No se pudo verificar el correo.'
        );
      }
    };

    verificar();
  }, [token]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 font-sans text-slate-900 p-8">
      <div className="w-full max-w-md text-center">

        {estado === 'verificando' && (
          <div className="space-y-4">
            <Loader2 size={48} className="animate-spin text-blue-600 mx-auto" />
            <h2 className="text-3xl font-black text-slate-900">Verificando...</h2>
            <p className="text-slate-500">Estamos confirmando tu correo electrónico.</p>
          </div>
        )}

        {estado === 'exito' && (
          <div className="space-y-5">
            <CheckCircle size={56} className="text-green-600 mx-auto" />
            <h2 className="text-3xl font-black text-slate-900">¡Correo verificado!</h2>
            <p className="text-slate-500 text-lg">{mensaje}</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 text-lg"
            >
              Iniciar sesión <ArrowRight size={20} />
            </button>
          </div>
        )}

        {estado === 'error' && (
          <div className="space-y-5">
            <XCircle size={56} className="text-red-500 mx-auto" />
            <h2 className="text-3xl font-black text-slate-900">No se pudo verificar</h2>
            <p className="text-slate-500 text-lg">{mensaje}</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 text-lg"
            >
              Volver al inicio <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerificarCorreo;