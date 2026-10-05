import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Search, Activity } from 'lucide-react';
import { useTema } from '../context/TemaContext';

function AdminHistorial() {
  const [analisis, setAnalisis] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const { modoOscuro } = useTema();

  const miUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/admin/historial-global', {
          params: { admin_id: miUsuario.id }
        });
        setAnalisis(res.data);
      } catch (err) {
        console.error('Error al cargar historial', err);
      } finally {
        setCargando(false);
      }
    };

    if (miUsuario.id) cargarHistorial();
  }, [miUsuario.id]);

  // Filtrar por nombre de archivo o correo
  const analisisFiltrados = analisis.filter(a => 
    a.nombre_archivo.toLowerCase().includes(busqueda.toLowerCase()) || 
    a.email_usuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Función para color de etiquetas de riesgo
  const getRiesgoColor = (riesgo) => {
    switch(riesgo) {
      case 'Bajo': return 'bg-green-100 text-green-700';
      case 'Medio': return 'bg-yellow-100 text-yellow-700';
      case 'Alto': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getEstadoColor = (estado) => {
    if (estado === 'Aprobado') return 'bg-green-100 text-green-700';
    if (estado === 'Atención Requerida') return 'bg-yellow-100 text-yellow-700';
    if (estado === 'Riesgo Alto') return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-700';
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
    <div className={`p-8 w-full min-h-screen ${modoOscuro ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black mb-1">Historial Global</h1>
          <p className={`${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>
            Supervisión de documentos analizados en la plataforma.
          </p>
        </div>
        
        {/* Buscador */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por archivo o usuario..." 
            value={busqueda} 
            onChange={e => setBusqueda(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${modoOscuro ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
          />
        </div>
      </div>

      <div className={`rounded-xl shadow-xl overflow-hidden ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${modoOscuro ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100 text-slate-600'} text-sm uppercase tracking-wider`}>
                <th className="p-4 font-bold">Archivo</th>
                <th className="p-4 font-bold">Usuario</th>
                <th className="p-4 font-bold">Fecha</th>
                <th className="p-4 font-bold text-center">Estado</th>
                <th className="p-4 font-bold text-center">Riesgo</th>
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
                      <span className="font-semibold">{a.nombre_archivo}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`${modoOscuro ? 'text-slate-300' : 'text-slate-600'}`}>{a.email_usuario}</span>
                  </td>

                  <td className="p-4">
                    <span className={`text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>{a.fecha_analisis}</span>
                  </td>

                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getEstadoColor(a.estado)}`}>
                      {a.estado}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiesgoColor(a.riesgo)}`}>
                      {a.riesgo}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
          
          {analisisFiltrados.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No hay análisis registrados aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminHistorial;