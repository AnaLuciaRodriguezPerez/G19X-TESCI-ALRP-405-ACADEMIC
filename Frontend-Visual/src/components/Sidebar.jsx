import React from 'react';
import { Home, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useTema } from '../context/TemaContext';

function Sidebar() {
  const location = useLocation();
  const { modoOscuro } = useTema();

  const esActivo = (ruta) => location.pathname === ruta;

  return (
    <div
      className="w-80 flex flex-col shadow-xl z-10 text-white transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-sidebar)' }}
    >
      {/* Logo */}
      <div className="p-8 flex flex-col items-center border-b border-white/10">
        <div
          className="bg-white rounded-full mb-4 shadow-lg overflow-hidden w-24 h-24 flex items-center justify-center border-4"
          style={{ borderColor: 'var(--color-primary)' }}
        >
          <img src={logo} alt="Logo DocuVerify" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold tracking-wider">DocuVerify</h1>
        <p className="text-center text-sm mt-3 leading-relaxed text-white/60">
          Sistema de Validación Documental<br />Basado en Reglas Jurídicas
        </p>
      </div>

      {/* Navegación */}
      <nav className="mt-6 flex flex-col gap-2 px-4">
        <Link to="/inicio">
          <button
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all w-full ${
              esActivo('/inicio') ? 'text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            style={esActivo('/inicio') ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            <Home size={24} />
            <span className="font-semibold text-lg">Inicio</span>
          </button>
        </Link>

        <Link to="/acuerdo-confidencialidad">
          <button
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all w-full ${
              esActivo('/acuerdo-confidencialidad')
                ? 'text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            style={esActivo('/acuerdo-confidencialidad') ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            <FileText size={24} />
            <span className="font-semibold text-lg text-left leading-tight">
              Acuerdo de<br />confidencialidad
            </span>
          </button>
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;