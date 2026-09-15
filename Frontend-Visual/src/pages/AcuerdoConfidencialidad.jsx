import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Upload,
  Search,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';

function AcuerdoConfidencialidad() {
  const [archivo, setArchivo] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [faseCarga, setFaseCarga] = useState('');
  const [progreso, setProgreso] = useState(0);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [resultado, setResultado] = useState(null);
  const inputRef = useRef(null);

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
    setArrastrando(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const validarYSeleccionar = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setMensaje({ tipo: 'error', texto: 'Solo se permiten archivos PDF' });
      setArchivo(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMensaje({ tipo: 'error', texto: 'El archivo supera 10 MB' });
      setArchivo(null);
      return;
    }
    setArchivo(file);
    setResultado(null);
    setMensaje({ tipo: '', texto: '' });
    setProgreso(0);
  };

  const manejarDragOver = (e) => {
    e.preventDefault();
    if (archivo || cargando || resultado) return;
    setArrastrando(true);
  };

  const manejarDragLeave = () => setArrastrando(false);

  const manejarDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    if (archivo || cargando || resultado) return;
    if (e.dataTransfer.files?.[0]) validarYSeleccionar(e.dataTransfer.files[0]);
  };

  const analizarDocumento = () => {
    if (!archivo) return;
    const formData = new FormData();
    formData.append('archivo', archivo);
    setCargando(true);
    setFaseCarga('subiendo');
    setProgreso(0);

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
        setMensaje({ tipo: 'exito', texto: '¡Análisis completado!' });
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al procesar el documento' });
      }
    };

    xhr.onerror = () => {
      setCargando(false);
      setFaseCarga('');
      setMensaje({ tipo: 'error', texto: 'Error de red' });
    };

    xhr.open('POST', 'http://127.0.0.1:8000/api/documentos/analizar');
    xhr.send(formData);
  };

  const seleccionDeshabilitada = cargando || archivo !== null || resultado !== null;

  return (
    <div
      className="flex-1 flex flex-col overflow-y-auto transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-content-bg)' }}
    >
      <header className="p-10 pb-6">
        <h2 className="text-4xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tight">
          Acuerdo de Confidencialidad
        </h2>
        <p className="text-center text-xl text-slate-600 dark:text-slate-300 mt-2 font-medium">
          Sube tu documento para validar
        </p>
        <div
          className="w-full h-0.5 mt-8 rounded-full opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
      </header>

      <main className="p-10 pt-0 max-w-7xl mx-auto w-full">
        <section
          onDragOver={manejarDragOver}
          onDragLeave={manejarDragLeave}
          onDrop={manejarDrop}
          className={`p-12 rounded-2xl shadow-sm border-2 border-dashed transition-all flex flex-col items-center justify-center gap-6 ${
            arrastrando
              ? 'border-blue-500 bg-blue-50/20 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700'
          }`}
          style={{ backgroundColor: 'var(--color-card-bg)' }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            disabled={seleccionDeshabilitada}
            onChange={(e) => {
              validarYSeleccionar(e.target.files[0]);
              e.target.value = '';
            }}
          />

          <div className="p-6 rounded-full bg-slate-100 dark:bg-slate-800/80">
            <Upload size={64} style={{ color: 'var(--color-primary)' }} />
          </div>

          <h3 className="text-2xl font-bold text-slate-800 dark:text-white text-center">
            Arrastra tu documento aquí
          </h3>
          <p className="text-lg text-slate-500 dark:text-slate-400 text-center max-w-md">
            O haz clic en el botón para seleccionar un archivo PDF
          </p>

          <button
            onClick={() => inputRef.current?.click()}
            type="button"
            disabled={seleccionDeshabilitada}
            className="mt-2 px-8 py-3 text-base text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 shadow-md flex items-center gap-3 transition-all"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <FileText size={20} />
            {archivo ? 'Documento seleccionado' : 'Seleccionar archivo'}
          </button>

          {archivo && (
            <div className="mt-4 w-full max-w-lg p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-500" size={24} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      {archivo.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {(archivo.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                {!resultado && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={analizarDocumento}
                      disabled={cargando}
                      className="px-4 py-2 text-sm text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Search size={16} />
                      {cargando ? 'Procesando...' : 'Analizar'}
                    </button>
                    <button
                      onClick={reiniciarTodo}
                      disabled={cargando}
                      className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {cargando && (
            <div className="w-full max-w-lg p-5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold text-sm">
                  {faseCarga === 'subiendo' ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-blue-600" />
                      <span>Subiendo documento...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="animate-spin text-amber-500" />
                      <span>Analizando con IA...</span>
                    </>
                  )}
                </div>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {faseCarga === 'subiendo' ? `${progreso}%` : 'Validando...'}
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: faseCarga === 'subiendo' ? `${progreso}%` : '100%' }}
                />
              </div>
            </div>
          )}

          {mensaje.texto && !cargando && (
            <div
              className={`text-center text-sm font-semibold px-4 py-2 rounded-lg max-w-lg w-full ${
                mensaje.tipo === 'error'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
              }`}
            >
              {mensaje.texto}
            </div>
          )}

          {resultado && !cargando && (
            <section className="mt-6 p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-blue-600" size={32} />
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                      Resultado de Validación
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Basado en reglas jurídicas
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${colorRiesgo(resultado.puntuacion_riesgo)}`}>
                  {resultado.estado} (Riesgo {resultado.puntuacion_riesgo})
                </span>
              </div>

              <div className="mt-6">
                <h4 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-3">
                  Cláusulas Detectadas:
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {(resultado.clausulas_detectadas || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <span className="text-base font-medium text-slate-700 dark:text-slate-200">
                        {item.nombre}
                      </span>
                      {item.estado === 'Cumple' ? (
                        <span className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                          <CheckCircle size={18} /> Cumple
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-sm font-bold text-amber-600">
                          <AlertTriangle size={18} /> Falta
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default AcuerdoConfidencialidad;