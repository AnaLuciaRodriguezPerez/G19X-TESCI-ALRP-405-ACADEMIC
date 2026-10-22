import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Upload, Search, CheckCircle, AlertTriangle, ShieldCheck,
  Loader2, Sparkles, FileSearch, Info, Eye, Lightbulb,
} from 'lucide-react';
import api from '../api';

function AcuerdoConfidencialidad() {
  // --- Estados ---
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  
  const [archivo, setArchivo] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [faseCarga, setFaseCarga] = useState('');
  const [progreso, setProgreso] = useState(0);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [resultado, setResultado] = useState(null);
  const [mostrarInforme, setMostrarInforme] = useState(false);
  const inputRef = useRef(null);

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Cargar los tipos de documento al iniciar
  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const respuesta = await fetch('http://127.0.0.1:8000/api/tipos-documento');
        const datos = await respuesta.json();
        setTiposDocumento(datos);
      } catch (error) {
        console.error('Error al cargar tipos de documento:', error);
      }
    };
    cargarTipos();
  }, []);

  // ⏱️ Temporizador para los mensajes
  useEffect(() => {
    if (!mensaje.texto) return;
    const temporizador = setTimeout(() => {
      setMensaje({ tipo: '', texto: '' });
    }, 4000);
    return () => clearTimeout(temporizador);
  }, [mensaje.texto]);

  const colorRiesgo = (riesgo) => {
    if (riesgo === 'Alto') return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    if (riesgo === 'Medio') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300';
  };

  const reiniciarTodo = () => {
    setArchivo(null);
    setResultado(null);
    setMensaje({ tipo: '', texto: '' });
    setProgreso(0);
    setFaseCarga('');
    setCargando(false);
    setMostrarInforme(false);
    setArrastrando(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const validarYSeleccionar = (file) => {
    if (!tipoSeleccionado) {
      setMensaje({ tipo: 'error', texto: 'Selecciona un tipo de documento primero.' });
      return;
    }
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setMensaje({ tipo: 'error', texto: 'Solo se permiten archivos en formato PDF (.pdf)' });
      setArchivo(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMensaje({ tipo: 'error', texto: 'El archivo supera el límite de 10 MB' });
      setArchivo(null);
      return;
    }

    setArchivo(file);
    setResultado(null);
    setMostrarInforme(false);
    setMensaje({ tipo: '', texto: '' });
    setProgreso(0);
  };

  const manejarDragOver = (e) => {
    e.preventDefault();
    if (archivo || cargando || resultado || !tipoSeleccionado) return;
    setArrastrando(true);
  };

  const manejarDragLeave = () => setArrastrando(false);

  const manejarDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    if (archivo || cargando || resultado || !tipoSeleccionado) {
      if(!tipoSeleccionado) setMensaje({ tipo: 'error', texto: 'Selecciona un tipo de documento primero.' });
      return;
    }
    if (e.dataTransfer.files?.[0]) validarYSeleccionar(e.dataTransfer.files[0]);
  };

  const analizarDocumento = () => {
    if (!archivo || !tipoSeleccionado) return;

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('tipo_documento_id', tipoSeleccionado);

    setCargando(true);
    setFaseCarga('subiendo');
    setProgreso(0);
    setMensaje({ tipo: '', texto: '' });
    setResultado(null);
    setMostrarInforme(false);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (evento) => {
      if (evento.lengthComputable) {
        const porcentaje = Math.round((evento.loaded / evento.total) * 100);
        setProgreso(porcentaje);
        if (porcentaje >= 100) setFaseCarga('analizando');
      }
    };

    xhr.onload = () => {
      setCargando(false);
      setFaseCarga('');
      if (xhr.status >= 200 && xhr.status < 300) {
        const datos = JSON.parse(xhr.responseText);
        setResultado(datos.resultado);
        setMensaje({ tipo: 'exito', texto: '¡Análisis jurídico completado con éxito!' });
      } else {
        try {
          const datos = JSON.parse(xhr.responseText);
          setMensaje({ tipo: 'error', texto: datos.detail || 'Error al procesar el documento' });
        } catch {
          setMensaje({ tipo: 'error', texto: 'Error al procesar la respuesta del servidor' });
        }
      }
    };

    xhr.onerror = () => {
      setCargando(false);
      setFaseCarga('');
      setMensaje({ tipo: 'error', texto: 'Error de red al conectar con el servidor' });
    };

    xhr.open('POST', 'http://127.0.0.1:8000/api/documentos/analizar');
    xhr.send(formData);
  };

    const aceptarValidacion = async () => {
    if (!resultado) return;
    if (!usuario?.id) {
      setMensaje({ tipo: 'error', texto: 'No se encontró la sesión del usuario.' });
      return;
    }

    try {
      setCargando(true);
    
      await api.post('/api/historial/guardar', {
        usuario_id: usuario.id,
        nombre_archivo: archivo?.name || 'documento.pdf',
        resultado_ia: resultado,
        tipo_documento_id: parseInt(tipoSeleccionado),
      });

      reiniciarTodo();
      setMensaje({ tipo: 'exito', texto: '¡Validación guardada en el historial con éxito!' });
    } catch (error) {
      setCargando(false);
      
      const msjError = error.response?.data?.detail || error.message || 'Error al guardar';
      setMensaje({ tipo: 'error', texto: msjError });
    }
  };

  const seleccionDeshabilitada = !tipoSeleccionado || cargando || archivo !== null || resultado !== null;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto transition-colors duration-300" style={{ backgroundColor: 'var(--color-content-bg)' }}>
      {/* ========== CABECERA ========== */}
      <header className="p-10 pb-6">
        <h2 className="text-4xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tight">
          Analizar Documento Legal
        </h2>
        <p className="text-center text-xl text-slate-600 dark:text-slate-300 mt-2 font-medium">
          Selecciona el tipo de documento y súbelo para validar
        </p>
        <div className="w-full h-0.5 mt-8 rounded-full opacity-50" style={{ backgroundColor: 'var(--color-primary)' }} />
      </header>

      <main className="p-10 pt-0 max-w-7xl mx-auto w-full">
        <div className={`grid gap-8 ${mostrarInforme && resultado ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          
          {/* ========== COLUMNA IZQUIERDA ========== */}
          <div className="flex flex-col gap-6">
            
            {/* DESPLEGABLE DE TIPO DE DOCUMENTO */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">
                1. ¿Qué tipo de documento vas a analizar?
              </label>
              <select
                value={tipoSeleccionado}
                onChange={(e) => {
                  setTipoSeleccionado(e.target.value);
                  if (archivo) reiniciarTodo();
                }}
                disabled={cargando || (archivo && resultado)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              >
                <option value="">-- Selecciona un tipo de documento --</option>
                {tiposDocumento.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </select>
            </div>

            {/* ZONA DE ARRASTRAR Y SUBIR */}
            <section
              onDragOver={manejarDragOver}
              onDragLeave={manejarDragLeave}
              onDrop={manejarDrop}
              className={`p-12 rounded-2xl shadow-sm border-2 border-dashed transition-all flex flex-col items-center justify-center gap-6 ${
                arrastrando ? 'border-blue-500 bg-blue-50/20 scale-[0.99]' : 'border-slate-300 dark:border-slate-700'
              } ${!tipoSeleccionado ? 'opacity-50 pointer-events-none' : ''}`}
              style={{ backgroundColor: 'var(--color-card-bg)' }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                disabled={seleccionDeshabilitada}
                onChange={(e) => { validarYSeleccionar(e.target.files[0]); e.target.value = ''; }}
              />

              <div className="p-6 rounded-full bg-slate-100 dark:bg-slate-800/80">
                <Upload size={64} style={{ color: 'var(--color-primary)' }} />
              </div>

              <h3 className="text-2xl font-bold text-slate-800 dark:text-white text-center">
                2. Sube tu documento PDF aquí
              </h3>

              <button
                onClick={() => inputRef.current?.click()}
                type="button"
                disabled={seleccionDeshabilitada}
                className="mt-2 px-8 py-3 text-base text-white font-semibold rounded-lg shadow-md flex items-center gap-3 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <FileText size={20} />
                {archivo ? 'Documento seleccionado' : 'Seleccionar archivo'}
              </button>

              {archivo && (
                <div className="mt-4 w-full max-w-lg p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                      <FileText className="text-blue-500 shrink-0" size={24} />
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{archivo.name}</p>
                      </div>
                    </div>
                    {!resultado && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={analizarDocumento} disabled={cargando} className="px-4 py-2 text-sm text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                          <Search size={16} /> {cargando ? 'Procesando...' : 'Analizar Documento'}
                        </button>
                        <button onClick={reiniciarTodo} disabled={cargando} className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50">
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {cargando && (
                <div className="w-full max-w-lg p-5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                    <span className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      {faseCarga === 'subiendo' ? <><Loader2 size={18} className="animate-spin text-blue-600" /> Subiendo PDF...</> : <><Sparkles size={18} className="animate-spin text-amber-500" /> Analizando cláusulas con IA...</>}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">{faseCarga === 'subiendo' ? `${progreso}%` : 'Validando...'}</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-900 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: faseCarga === 'subiendo' ? `${progreso}%` : '100%' }} />
                  </div>
                </div>
              )}

              {mensaje.texto && !cargando && (
                <div className={`text-center text-sm font-semibold px-4 py-2 rounded-lg max-w-lg w-full ${mensaje.tipo === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'}`}>
                  {mensaje.texto}
                </div>
              )}
            </section>

            {resultado && !cargando && (
              <section className="p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col gap-6" style={{ backgroundColor: 'var(--color-card-bg)' }}>
                <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-700 flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-blue-600" size={32} />
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Resultado Legal</h3>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${colorRiesgo(resultado.puntuacion_riesgo)}`}>
                    {resultado.estado} (Riesgo {resultado.puntuacion_riesgo})
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-3">Evaluación rápida:</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {(resultado.clausulas_detectadas || []).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className="text-base font-medium text-slate-700 dark:text-slate-200">{item.nombre}</span>
                        {item.estado === 'Cumple' ? (
                          <span className="flex items-center gap-1.5 text-sm font-bold text-green-600 shrink-0"><CheckCircle size={18} /> Cumple</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm font-bold text-amber-600 shrink-0"><AlertTriangle size={18} /> Falta</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button onClick={() => setMostrarInforme((v) => !v)} className="flex-1 px-6 py-3.5 text-base text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 hover:opacity-90" style={{ backgroundColor: 'var(--color-primary)' }}>
                    <FileSearch size={20} /> {mostrarInforme ? 'Ocultar informe detallado' : 'Ver informe detallado'}
                  </button>
                  <button onClick={aceptarValidacion} disabled={cargando} className="flex-1 px-6 py-3.5 text-base text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 transition-all">
                    <CheckCircle size={20} /> Aceptar validación
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* ========== COLUMNA DERECHA: INFORME ========== */}
          {mostrarInforme && resultado && !cargando && (
            <section className="rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col lg:sticky lg:top-6 max-h-[calc(100vh-6rem)]" style={{ backgroundColor: 'var(--color-card-bg)' }}>
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSearch className="text-blue-600" size={26} />
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Informe detallado</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{archivo?.name}</p>
                  </div>
                </div>
                <button onClick={() => setMostrarInforme(false)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Ocultar</button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
                <div>
                  <h4 className="font-bold text-lg mb-2">Resumen ejecutivo</h4>
                  <p className="text-base bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/40">{resultado.resumen_ejecutivo}</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-4">Evaluación de Cláusulas</h4>
                  <div className="flex flex-col gap-5">
                    {(resultado.clausulas_detectadas || []).map((c, i) => (
                      <article key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                        <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                          <h5 className="font-bold text-base">{c.nombre}</h5>
                          {c.estado === 'Cumple' ? <span className="flex items-center gap-1 text-green-600"><CheckCircle size={18}/> Cumple</span> : <span className="flex items-center gap-1 text-amber-600"><AlertTriangle size={18}/> Falta</span>}
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                          <div><p className="font-bold mb-1"><Info className="inline text-blue-500 mr-2" size={18}/>¿Para qué sirve?</p><p className="pl-7 text-slate-600 dark:text-slate-400">{c.proposito}</p></div>
                          <div><p className="font-bold mb-1"><Eye className="inline text-slate-500 mr-2" size={18}/>Observaciones</p><p className="pl-7 text-slate-600 dark:text-slate-400">{c.observaciones}</p></div>
                          <div className="p-4 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"><p className="font-bold mb-1"><Lightbulb className="inline text-amber-500 mr-2" size={18}/>Recomendación</p><p className="pl-7 italic text-slate-600 dark:text-slate-400">{c.recomendacion}</p></div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default AcuerdoConfidencialidad;