import React, { useState, useEffect } from 'react';
import { FileText, Eye } from 'lucide-react';

function Historial() {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    const cargarHistorial = async () => {
      if (!usuario.id) return;
      try {
        const respuesta = await fetch(`http://127.0.0.1:8000/api/historial/${usuario.id}`);
        if (respuesta.ok) {
          const datos = await respuesta.json();
          setHistorial(datos);
        }
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarHistorial();
  }, [usuario.id]);

  const getEstadoColor = (estado) => {
    if (estado?.includes('Aprobado')) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    if (estado?.includes('Atención')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
  };

  const getRiesgoColor = (riesgo) => {
    if (riesgo?.includes('Bajo')) return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300';
    if (riesgo?.includes('Medio')) return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300';
    return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300';
  };

  return (
    <div
      className="flex-1 flex flex-col overflow-y-auto transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-content-bg)' }}
    >
      <header className="p-10 pb-6">
        <h2 className="text-4xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tight">
          Historial de Análisis
        </h2>
        <p className="text-center text-xl text-slate-600 dark:text-slate-300 mt-2 font-medium">
          Revisa los dictámenes jurídicos de los documentos que has validado anteriormente
        </p>
        <div
          className="w-full h-0.5 mt-8 rounded-full opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        ></div>
      </header>

      <main className="p-10 pt-0 max-w-6xl mx-auto w-full flex flex-col gap-12">
        <section
          className="p-8 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 transition-colors overflow-hidden"
          style={{ backgroundColor: 'var(--color-card-bg)' }}
        >
          {cargando ? (
            <div className="text-center p-8 text-slate-500">Cargando tu historial...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Fecha de Análisis</th>
                    <th className="p-4 font-semibold">Documento</th>
                    <th className="p-4 font-semibold">Estado Global</th>
                    <th className="p-4 font-semibold">Nivel de Riesgo</th>
                    <th className="p-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {historial.map((item) => (
                    <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {new Date(item.fecha_analisis).toLocaleDateString('es-MX', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 font-medium text-slate-800 dark:text-white flex items-center gap-3">
                        <FileText className="w-6 h-6 text-red-500 shrink-0" />
                        {item.nombre_archivo}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full font-medium text-xs ${getEstadoColor(item.resultado_ia?.estado)}`}>
                          {item.resultado_ia?.estado}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-md border font-semibold text-xs ${getRiesgoColor(item.resultado_ia?.puntuacion_riesgo)}`}>
                          Riesgo: {item.resultado_ia?.puntuacion_riesgo}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          className="font-medium text-sm hover:underline flex items-center justify-center gap-1 mx-auto"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          <Eye size={16} /> Ver Informe
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {historial.length === 0 && (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  Aún no has analizado ningún documento. Ve a "Acuerdo de confidencialidad" para validar tu primer PDF.
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Historial;