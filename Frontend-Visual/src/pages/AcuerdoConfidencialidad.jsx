import React from 'react';

function AcuerdoConfidencialidad() {
  return (
    <div className="flex-1 p-8 bg-slate-50">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800">
          Acuerdo de Confidencialidad
        </h2>
        <p className="text-slate-600 mt-2">Sube tu documento para validar</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <section className="p-8 bg-white rounded-lg shadow-sm border-2 border-dashed border-slate-300 text-center">
          <h3 className="text-xl font-bold text-slate-700 mb-4">Arrastra tu documento aquí</h3>
          <p className="text-slate-500 mb-6">O haz clic para seleccionar un archivo PDF</p>
          <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg">
            Seleccionar archivo
          </button>
        </section>
      </main>
    </div>
  );
}

export default AcuerdoConfidencialidad;