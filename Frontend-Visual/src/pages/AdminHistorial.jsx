import React, { useState, useEffect } from 'react';
import api from '../api'; 
import { FileText, Search, Activity } from 'lucide-react';
import { useTema } from '../context/TemaContext';
import PageHeader from '../components/PageHeader';

function AdminHistorial() {
  const [analisis, setAnalisis] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const { modoOscuro } = useTema();

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const res = await api.get('/api/admin/historial-global');
        setAnalisis(res.data);
      } catch (err) {
        console.error('Error al cargar historial', err);
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, []);

  const analisisFiltrados = analisis.filter(a => 
    a.nombre_archivo.toLowerCase().includes(busqueda.toLowerCase()) || 
    a.email_usuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getRiesgoColor = (riesgo) => {
    switch(riesgo) {
      case 'Bajo': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
      case 'Medio': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'Alto': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getEstadoColor = (estado) => {
    if (estado === 'Aprobado') return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
    if (estado === 'Atención Requerida') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
    if (estado === 'Riesgo Alto') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  };

  if (cargando) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center text-blue-600 gap-4">
          <Activity className="animate-spin" size={48} />
          <p className="font-semibold">Cargando historial de la plataforma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto transition-colors duration-300 ${modoOscuro ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <PageHeader
        titulo="Historial Global"
        subtitulo="Supervisión de documentos analizados en la plataforma."
      />

      {/* CONTENIDO */}
      <main className="p-10 pt-0 w-full flex flex-col gap-8">
        {/* Buscador */}
        <div className="flex justify-end w-full">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por archivo o usuario..." 
              value={busqueda} 
              onChange={e => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${modoOscuro ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' : 'bg-white border-slate-300'}`}
            />
          </div>
        </div>

        <div className={`rounded-2xl shadow-sm border border-black/5 dark:border-white/10 overflow-hidden ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${modoOscuro ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100 text-slate-600'} text-sm uppercase tracking-wider`}>
                  <th className="p-4 font-semibold">Archivo</th>
                  <th className="p-4 font-semibold">Usuario</th>
                  <th className="p-4 font-semibold">Fecha</th>
                  <th className="p-4 font-semibold text-center">Estado</th>
                  <th className="p-4 font-semibold text-center">Riesgo</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${modoOscuro ? 'divide-slate-700' : 'divide-slate-200'}`}>
                {analisisFiltrados.map((a) => (
                  <tr key={a.id} className={`hover:${modoOscuro ? 'bg-slate-700/30' : 'bg-slate-50'} transition-colors`}>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${modoOscuro ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <FileText size={20} className={modoOscuro ? 'text-blue-400' : 'text-blue-600'} />
                        </div>
                        <span className="font-medium">{a.nombre_archivo}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`${modoOscuro ? 'text-slate-300' : 'text-slate-600'}`}>{a.email_usuario}</span>
                    </td>

                    <td className="p-4">
                      <span className={`text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>{a.fecha_analisis}</span>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(a.estado)}`}>
                        {a.estado}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiesgoColor(a.riesgo)}`}>
                        {a.riesgo}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
            
            {analisisFiltrados.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No hay análisis registrados aún.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminHistorial;