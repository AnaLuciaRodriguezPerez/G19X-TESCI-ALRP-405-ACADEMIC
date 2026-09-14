import React, { useState, useRef } from 'react';
import { FileText, Upload } from 'lucide-react';

function AcuerdoConfidencialidad() {
  const [archivo, setArchivo] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef(null);

  const validarYSeleccionar = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return;
    }
    setArchivo(file);
  };

  const manejarDragOver = (e) => {
    e.preventDefault();
    setArrastrando(true);
  };

  const manejarDragLeave = () => setArrastrando(false);

  const manejarDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    if (e.dataTransfer.files?.[0]) validarYSeleccionar(e.dataTransfer.files[0]);
  };

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
            className="mt-2 px-8 py-3 text-base text-white font-semibold rounded-lg hover:opacity-90 shadow-md flex items-center gap-3 transition-all"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <FileText size={20} />
            {archivo ? 'Documento seleccionado' : 'Seleccionar archivo'}
          </button>

          {archivo && (
            <div className="mt-4 w-full max-w-lg p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
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
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AcuerdoConfidencialidad;