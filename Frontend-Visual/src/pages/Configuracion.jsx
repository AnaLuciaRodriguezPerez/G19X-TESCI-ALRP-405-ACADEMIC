import React, { useState } from 'react';
import { User, Palette, Check, Moon, Sun } from 'lucide-react';
import { useTema, TEMAS } from '../context/TemaContext';

function Configuracion() {
  const { color, setColor, modoOscuro, setModoOscuro } = useTema();
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario')) || {};

  const [nombre] = useState(usuarioGuardado.nombre || '');
  const [apellidoPaterno] = useState(usuarioGuardado.apellido_paterno || '');
  const [apellidoMaterno] = useState(usuarioGuardado.apellido_materno || '');
  const [email] = useState(usuarioGuardado.email || '');

  const inputGray = 'w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg outline-none bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default transition-all';

  return (
    <div className="flex-1 flex flex-col overflow-y-auto transition-colors duration-300" style={{ backgroundColor: 'var(--color-content-bg)' }}>
      <header className="p-10 pb-6">
        <h2 className="text-4xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tight">Configuración</h2>
        <p className="text-center text-xl text-slate-600 dark:text-slate-400 mt-2 font-medium">Administra tu cuenta y preferencias del sistema</p>
        <div className="w-full h-0.5 mt-8 rounded-full opacity-50" style={{ backgroundColor: 'var(--color-primary)' }} />
      </header>

      <main className="p-10 pt-0 max-w-4xl mx-auto flex flex-col gap-8 w-full">
        {/* PERFIL */}
        <section className="p-8 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 flex gap-6 items-start transition-colors" style={{ backgroundColor: 'var(--color-card-bg)' }}>
          <div className="p-4 rounded-full text-white shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}><User size={32} /></div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Datos del perfil</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Estos datos son de solo lectura actualmente.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre</label><input type="text" value={nombre} disabled className={inputGray} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Apellido Paterno</label><input type="text" value={apellidoPaterno} disabled className={inputGray} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Apellido Materno</label><input type="text" value={apellidoMaterno} disabled className={inputGray} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label><input type="email" value={email} disabled className={inputGray} /></div>
            </div>
          </div>
        </section>

        {/* PERSONALIZACIÓN */}
        <section className="p-8 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 flex gap-6 items-start transition-colors" style={{ backgroundColor: 'var(--color-card-bg)' }}>
          <div className="p-4 rounded-full text-white shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}><Palette size={32} /></div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Personalización</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Elige el color y el modo de la interfaz.</p>
            <div className="flex items-center justify-between p-4 rounded-xl mb-8" style={{ backgroundColor: modoOscuro ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-3">
                {modoOscuro ? <Moon style={{ color: 'var(--color-primary)' }} /> : <Sun style={{ color: 'var(--color-primary)' }} />}
                <div>
                  <p className="font-bold text-slate-700 dark:text-white">Modo Oscuro</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{modoOscuro ? 'Activado' : 'Desactivado'}</p>
                </div>
              </div>
              <button onClick={() => setModoOscuro(!modoOscuro)} className="w-14 h-8 rounded-full transition-colors relative" style={{ backgroundColor: modoOscuro ? 'var(--color-primary)' : '#cbd5e1' }}>
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow ${modoOscuro ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="font-bold text-slate-700 dark:text-white mb-4">Color principal</p>
            <div className={`flex gap-5 flex-wrap transition-all duration-300 ${modoOscuro ? 'opacity-40 pointer-events-none' : ''}`}>
              {Object.entries(TEMAS).map(([clave, tema]) => (
                <button key={clave} onClick={() => setColor(clave)} disabled={modoOscuro} className="flex flex-col items-center gap-2 group">
                  <div className={`w-16 h-16 rounded-full ${tema.swatch} shadow-md group-hover:scale-110 transition-transform flex items-center justify-center`} style={color === clave ? { boxShadow: `0 0 0 3px ${modoOscuro ? '#1e293b' : '#fff'}, 0 0 0 6px ${tema.primary}` } : {}}>
                    {color === clave && <Check className="text-white" size={28} />}
                  </div>
                  <span className={`font-semibold text-sm ${color === clave ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{tema.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Configuracion;