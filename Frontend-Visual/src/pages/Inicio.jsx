import React from 'react';

function Inicio() {
  return (
    <div className="flex-1 p-8 bg-slate-100 font-sans text-slate-900">
      
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800">
          Bienvenid@ a DocuVerify
        </h2>
        <p className="text-slate-600 mt-2">
          Validación documental inteligente
        </p>
      </header>

      <main className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Qué es */}
        <section className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-2">¿Qué es?</h3>
          <p className="text-slate-600">
            DocuVerify es una herramienta diseñada para apoyar la revisión de documentos jurídicos mediante reglas de validación.
          </p>
        </section>

        {/* Objetivo */}
        <section className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Objetivo</h3>
          <p className="text-slate-600">
            Analiza tu documento para identificar elementos requeridos, posibles inconsistencias y criterios que necesitan revisión.
          </p>
        </section>

        {/* Cómo funciona */}
        <section className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Cómo funciona</h3>
          <p className="text-slate-600">
            1. Carga tu documento <br />
            2. Analiza el contenido <br />
            3. Aplica las reglas <br />
            4. Identifica puntos importantes <br />
            5. Consulta el resultado
          </p>
        </section>

      </main>
    </div>
  );
}

export default Inicio;