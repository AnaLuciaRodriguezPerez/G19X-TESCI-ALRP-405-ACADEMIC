import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, CheckCircle, Info, Eye, Lightbulb, X, Upload, Loader2, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import api from '../api';

function Historial() {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [informeSeleccionado, setInformeSeleccionado] = useState(null);


  const [itemParaVersion, setItemParaVersion] = useState(null);
  const [archivoV2, setArchivoV2] = useState(null);
  const [subiendoV2, setSubiendoV2] = useState(false);
  const [errorV2, setErrorV2] = useState('');



  const [desplegados, setDesplegados] = useState({});

  const toggleDesplegar = (id) => {
    setDesplegados(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const gruposDocumentos = React.useMemo(() => {
    const mapa = {};
    
    historial.forEach((item) => {
      const raizId = item.analisis_padre_id || item.id;
      if (!mapa[raizId]) {
        mapa[raizId] = [];
      }
      mapa[raizId].push(item);
    });

    Object.keys(mapa).forEach((raizId) => {
      mapa[raizId].sort((a, b) => (b.version || 1) - (a.version || 1));
    });

    return Object.values(mapa).sort((a, b) => new Date(b[0].fecha_analisis) - new Date(a[0].fecha_analisis));
  }, [historial]);


  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const respuesta = await api.get('/api/historial');
        setHistorial(respuesta.data);
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarHistorial();
  }, []);

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


  const handleSubirNuevaVersion = async () => {
    if (!archivoV2 || !itemParaVersion) return;

    setSubiendoV2(true);
    setErrorV2('');

    try {
      const formData = new FormData();
      formData.append('archivo', archivoV2);
      formData.append('tipo_documento_id', itemParaVersion.tipo_documento_id || 1);

      const analisisResp = await api.post('/api/documentos/analizar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const resultado = analisisResp.data.resultado;

      await api.post('/api/historial/guardar', {
        usuario_id: itemParaVersion.usuario_id, // el backend usa el del token igual
        nombre_archivo: archivoV2.name,
        resultado_ia: resultado,
        tipo_documento_id: itemParaVersion.tipo_documento_id || 1,
        analisis_padre_id: itemParaVersion.analisis_padre_id || itemParaVersion.id,
      });

      const refresco = await api.get('/api/historial');
      setHistorial(refresco.data);

      setItemParaVersion(null);
      setArchivoV2(null);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        'No se pudo analizar la nueva versión. Intenta de nuevo.';
      setErrorV2(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubiendoV2(false);
    }
  };


  return (
    <div
      className="flex-1 flex flex-col overflow-y-auto transition-colors duration-300 relative"
      style={{ backgroundColor: 'var(--color-content-bg)' }}
    >
      {/* ENCABEZADO */}
      <header className="p-10 pb-6">
        <h2 className="text-4xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tight">
          Historial de Análisis
        </h2>
        <p className="text-center text-xl text-slate-600 dark:text-slate-300 mt-2 font-medium">
          Revisa los dictámenes jurídicos de los documentos que has validado anteriormente
        </p>
        <div className="w-full h-0.5 mt-8 rounded-full opacity-50" style={{ backgroundColor: 'var(--color-primary)' }}></div>
      </header>

      {/* TABLA PRINCIPAL */}
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
                    <th className="p-4 w-10"></th>
                    <th className="p-4 font-semibold">Fecha de Análisis</th>
                    <th className="p-4 font-semibold">Documento</th>
                    <th className="p-4 font-semibold">Estado Global</th>
                    <th className="p-4 font-semibold">Nivel de Riesgo</th>
                    <th className="p-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {gruposDocumentos.map((grupo) => {
                    const ultimaVersion = grupo[0]; // La versión más nueva
                    const tieneVariasVersiones = grupo.length > 1;
                    const raizId = ultimaVersion.analisis_padre_id || ultimaVersion.id;
                    const estaAbierto = !!desplegados[raizId];

                    return (
                      <React.Fragment key={raizId}>
                        {/* FILA PRINCIPAL (Muestra la versión más reciente) */}
                        <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="p-4 text-center">
                            {tieneVariasVersiones && (
                              <button
                                onClick={() => toggleDesplegar(raizId)}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                                title="Ver historial de versiones"
                              >
                                {estaAbierto ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                              </button>
                            )}
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">
                            {new Date(ultimaVersion.fecha_analisis).toLocaleDateString('es-MX', {
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td className="p-4 font-medium text-slate-800 dark:text-white">
                            <div className="flex items-center gap-3">
                              <FileText className="w-6 h-6 text-red-500 shrink-0" />
                              <div className="flex flex-col">
                                <span className="flex items-center gap-2">
                                  {ultimaVersion.nombre_archivo}
                                  {tieneVariasVersiones && (
                                    <span className="inline-flex items-center gap-1 text-[11px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                                      <Layers size={12} /> {grupo.length} vers.
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-0.5">
                                  Versión {ultimaVersion.version || 1} (Última)
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full font-medium text-xs ${getEstadoColor(ultimaVersion.resultado_ia.estado)}`}>
                              {ultimaVersion.resultado_ia.estado}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-md border font-semibold text-xs ${getRiesgoColor(ultimaVersion.resultado_ia.puntuacion_riesgo)}`}>
                              Riesgo: {ultimaVersion.resultado_ia.puntuacion_riesgo}
                            </span>
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <div className="flex flex-col items-center gap-1.5">
                              <button
                                onClick={() => setInformeSeleccionado(ultimaVersion)}
                                className="font-medium text-sm hover:underline flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                                style={{ color: 'var(--color-primary)' }}
                              >
                                <Eye size={16} className="shrink-0" /> Ver Informe
                              </button>
                              <button
                                onClick={() => {
                                  setItemParaVersion(ultimaVersion);
                                  setArchivoV2(null);
                                  setErrorV2('');
                                }}
                                className="font-medium text-xs hover:underline flex items-center justify-center gap-1 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                              >
                                <Upload size={14} className="shrink-0" /> Nueva versión
                              </button>
                            </div>
                          </td>
                        </tr>

                        {estaAbierto && tieneVariasVersiones && grupo.slice(1).map((subItem) => (
                          <tr key={subItem.id} className="bg-slate-50/80 dark:bg-slate-800/40 border-l-4 border-blue-500 transition-colors">
                            <td></td>
                            <td className="p-3 pl-6 text-xs text-slate-500 dark:text-slate-400">
                              {new Date(subItem.fecha_analisis).toLocaleDateString('es-MX', {
                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                            <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                              <div className="flex items-center gap-2 pl-4">
                                <span className="text-slate-400 text-xs font-mono">└─</span>
                                <span className="text-xs">{subItem.nombre_archivo}</span>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.2 rounded">
                                  Versión {subItem.version || 1}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${getEstadoColor(subItem.resultado_ia.estado)}`}>
                                {subItem.resultado_ia.estado}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded border font-semibold text-[11px] ${getRiesgoColor(subItem.resultado_ia.puntuacion_riesgo)}`}>
                                Riesgo: {subItem.resultado_ia.puntuacion_riesgo}
                              </span>
                            </td>
                            <td className="p-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => setInformeSeleccionado(subItem)}
                                className="font-medium text-xs hover:underline flex items-center justify-center gap-1 mx-auto text-slate-600 dark:text-slate-400 whitespace-nowrap"
                              >
                                <Eye size={14} className="shrink-0" /> Ver Informe v{subItem.version || 1}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
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

      {/* MODAL DEL INFORME DETALLADO */}
      {informeSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Cabecera del Modal */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Informe detallado</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{informeSeleccionado.nombre_archivo}</p>
                </div>
              </div>
              <button
                onClick={() => setInformeSeleccionado(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <X size={18} /> Cerrar
              </button>
            </div>

            {/* Cuerpo del Modal con scroll */}
            <div className="p-6 overflow-y-auto">

              {/* Badges superiores */}
              <div className="flex gap-3 mb-6">
                <span className={`px-4 py-1.5 rounded-full font-bold text-sm ${getEstadoColor(informeSeleccionado.resultado_ia.estado)}`}>
                  {informeSeleccionado.resultado_ia.estado}
                </span>
                <span className={`px-4 py-1.5 rounded-full font-bold text-sm bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300`}>
                  Riesgo: {informeSeleccionado.resultado_ia.puntuacion_riesgo}
                </span>
              </div>

              {/* Resumen Ejecutivo */}
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Resumen ejecutivo</h4>
              <div className="bg-[#f0f4f8] dark:bg-slate-800 border border-blue-100 dark:border-slate-700 p-5 rounded-xl mb-8">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {informeSeleccionado.resultado_ia.resumen_ejecutivo}
                </p>
              </div>

              {/* Evaluación de Cláusulas */}
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Evaluación de Cláusulas Clave</h4>

              <div className="flex flex-col gap-5">
                {(informeSeleccionado.resultado_ia.clausulas_detectadas || []).map((clausula, index) => {
                  const cumple = clausula.estado?.toLowerCase().includes('cumple');

                  return (
                    <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50">

                      {/* Cabecera de la cláusula */}
                      <div className="bg-[#f8fafc] dark:bg-slate-800 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-800 dark:text-white text-base">
                          {clausula.nombre}
                        </span>
                        <div className={`flex items-center gap-1.5 font-bold text-sm ${cumple ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {cumple ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                          {cumple ? 'Cumple' : 'Falta'}
                        </div>
                      </div>

                      {/* Detalles de la cláusula */}
                      <div className="p-5 flex flex-col gap-4">
                        {/* 1. Propósito */}
                        <div>
                          <p className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                            <Info size={18} className="text-blue-500 shrink-0" />
                            ¿Para qué sirve?
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 text-sm pl-7 leading-relaxed">
                            {clausula.proposito || 'Cláusula esencial en un acuerdo de confidencialidad.'}
                          </p>
                        </div>

                        {/* 2. Observaciones */}
                        <div>
                          <p className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                            <Eye size={18} className="text-slate-500 shrink-0" />
                            Observaciones detectadas
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 text-sm pl-7 leading-relaxed">
                            {clausula.observaciones || (cumple ? 'Se identificó correctamente en el documento.' : 'No se encontró de forma clara en el documento.')}
                          </p>
                        </div>

                        {/* 3. RECOMENDACIÓN DE LA IA (SOLO SE MUESTRA SI LA CLÁUSULA FALTA) */}
                        {!cumple && (
                          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 mt-1">
                            <p className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                              <Lightbulb size={18} className="text-amber-500 shrink-0" />
                              Recomendación
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm pl-7 italic leading-relaxed">
                              {clausula.recomendacion || 'Se recomienda redactar e incorporar esta cláusula de forma explícita.'}
                            </p>
                          </div>
                        )}

                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}


      {/* ========== MODAL: SUBIR NUEVA VERSIÓN ========== */}
      {itemParaVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">

            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Subir nueva versión
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Se re-analizará y quedará enlazado a:
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1 truncate">
                  {itemParaVersion.nombre_archivo}
                </p>
              </div>
              <button
                onClick={() => !subiendoV2 && setItemParaVersion(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                <Upload className="w-8 h-8 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-300 text-center">
                  {archivoV2
                    ? archivoV2.name
                    : 'Haz clic para seleccionar el PDF corregido'}
                </span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  disabled={subiendoV2}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setArchivoV2(f);
                  }}
                />
              </label>

              {errorV2 && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  {errorV2}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  disabled={subiendoV2}
                  onClick={() => setItemParaVersion(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!archivoV2 || subiendoV2}
                  onClick={handleSubirNuevaVersion}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {subiendoV2 ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Analizar y guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default Historial;