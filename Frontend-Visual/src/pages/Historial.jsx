import React from 'react';

function Historial() {
  return (
    <div className="flex-1 p-8 bg-slate-50">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800">
          Historial de Análisis
        </h2>
        <p className="text-slate-600 mt-2">
          Revisa los documentos que has validado anteriormente
        </p>
      </header>

      <main className="max-w-5xl mx-auto">
        <section className="p-6 bg-white rounded-lg shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm text-slate-500 uppercase">
                <th className="p-3">Fecha</th>
                <th className="p-3">Documento</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Riesgo</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 text-slate-500" colSpan="5">
                  Aún no hay documentos analizados.
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default Historial;