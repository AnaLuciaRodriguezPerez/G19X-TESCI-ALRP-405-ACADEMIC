import React, { useState } from 'react';
import { Home, FileText, Settings, LogOut, User, History } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useTema } from '../context/TemaContext';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { modoOscuro } = useTema();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const confirmarCerrarSesion = () => {
    localStorage.removeItem('usuario');
    setMostrarConfirmacion(false);
    navigate('/');
  };

  const esActivo = (ruta) => location.pathname === ruta;

  return (
    <div
      className="w-80 flex flex-col justify-between shadow-xl z-10 text-white transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-sidebar)' }}
    >
      <div>
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

          {/* Mini perfil */}
          {usuario?.nombre && (
            <div className="mt-5 flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-white/10">
              <div
                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 shrink-0"
                style={{ borderColor: 'var(--color-primary)' }}
              >
                {usuario.foto ? (
                  <img src={usuario.foto} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-white/70" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">
                  {usuario.nombre} {usuario.apellido_paterno}
                </p>
                <p className="text-xs text-white/50 truncate">{usuario.email}</p>
              </div>
            </div>
          )}
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

          {/* 👇 NUEVO: Historial */}
          <Link to="/historial">
            <button
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all w-full ${
                esActivo('/historial')
                  ? 'text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              style={esActivo('/historial') ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
              <History size={24} />
              <span className="font-semibold text-lg">Historial</span>
            </button>
          </Link>
        </nav>
      </div>

      {/* Abajo */}
      <div className="p-4 border-t border-white/10 flex flex-col gap-2">
        <Link to="/configuracion">
          <button
            className={`flex items-center gap-4 px-4 py-3 w-full rounded-lg transition-all ${
              esActivo('/configuracion')
                ? 'text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            style={esActivo('/configuracion') ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            <Settings size={24} />
            <span className="font-semibold text-lg">Configuración</span>
          </button>
        </Link>

        <button
          onClick={() => setMostrarConfirmacion(true)}
          className="flex items-center gap-4 px-4 py-3 w-full rounded-lg transition-colors text-white/70 hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut size={24} />
          <span className="font-semibold text-lg">Cerrar Sesión</span>
        </button>
      </div>

      {/* Modal cerrar sesión */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMostrarConfirmacion(false)}
          />
          <div
            className="relative rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
            style={{ backgroundColor: 'var(--color-card-bg)', color: modoOscuro ? '#fff' : '#0f172a' }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-5">
                <LogOut size={30} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-black mb-2">¿Cerrar sesión?</h3>
              <p className="mb-8 leading-relaxed opacity-70">
                ¿Estás seguro de que deseas salir de DocuVerify?
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setMostrarConfirmacion(false)}
                  className="flex-1 py-3 font-bold rounded-xl bg-slate-200 dark:bg-slate-600 hover:opacity-80 transition-opacity"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarCerrarSesion}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                >
                  Sí, cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;