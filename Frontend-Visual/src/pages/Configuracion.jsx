import React, { useState } from 'react';
import { User } from 'lucide-react';

function Configuracion() {
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario')) || {};
  const [nombre] = useState(usuarioGuardado.nombre || '');
  const [apellidoPaterno] = useState(usuarioGuardado.apellido_paterno || '');
  const [apellidoMaterno] = useState(usuarioGuardado.apellido_materno || '');
  const [email] = useState(usuarioGuardado.email || '');

  const inputGray = 'w-full p-3 border border-slate-300 rounded-lg outline-none bg-slate-100 text-slate-500 cursor-default';

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
      <header className="p-10 pb-6">
        <h2 className="text-4xl font-black text-center text-slate-900 uppercase tracking-tight">Configuración</h2>
        <p className="text-center text-xl text-slate-600 mt-2 font-medium">Administra tu cuenta y preferencias</p>
      </header>
      
      <main className="p-10 pt-0 max-w-4xl mx-auto flex flex-col gap-8 w-full">
        <section className="p-8 rounded-2xl shadow-sm border bg-white flex gap-6 items-start">
          <div className="p-4 rounded-full text-white shrink-0 bg-blue-600">
            <User size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 mb-1">Datos del perfil</h3>
            <p className="text-slate-500 mb-6 text-sm">Estos datos son de solo lectura.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
                <input type="text" value={nombre} disabled className={inputGray} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido Paterno</label>
                <input type="text" value={apellidoPaterno} disabled className={inputGray} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido Materno</label>
                <input type="text" value={apellidoMaterno} disabled className={inputGray} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input type="email" value={email} disabled className={inputGray} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Configuracion;