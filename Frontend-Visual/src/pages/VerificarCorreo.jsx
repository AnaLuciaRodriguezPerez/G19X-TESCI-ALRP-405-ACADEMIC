import React, { useState, useEffect } from 'react'; 
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

function VerificarCorreo() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [estado, setEstado] = useState('verificando');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    // ❌ Error: Al no tener ref, se ejecuta 2 veces seguidas en desarrollo y falla
    const verificar = async () => {
      try {
        const respuesta = await axios.get('http://127.0.0.1:8000/verificar-correo', {
          params: { token },
        });
        setEstado('exito');
        setMensaje(respuesta.data.mensaje);
      } catch (err) {
        setEstado('error');
        setMensaje('No se pudo verificar el correo.');
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
          </div>
        )}
        {estado === 'exito' && (
          <div className="space-y-5">
            <CheckCircle size={56} className="text-green-600 mx-auto" />
            <h2 className="text-3xl font-black text-slate-900">¡Correo verificado!</h2>
            <button onClick={() => navigate('/')} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl">
              Iniciar sesión
            </button>
          </div>
        )}
        {estado === 'error' && (
          <div className="space-y-5">
            <XCircle size={56} className="text-red-500 mx-auto" />
            <h2 className="text-3xl font-black text-slate-900">Error</h2>
            <button onClick={() => navigate('/')} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl">
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerificarCorreo;