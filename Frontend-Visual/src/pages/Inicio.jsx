import React from 'react';
import { HelpCircle, Target, Zap } from 'lucide-react';

import imagenQueEs from '../assets/que es.png';
import imagenObjetivo from '../assets/objetivos.png';
import imagenfunciona from '../assets/como funciona.png';

function Inicio() {
  return (
    <div
      className="flex-1 flex flex-col overflow-y-auto transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-content-bg)' }}
    >
      
      <header className="p-10 pb-6">
        <h2 className="text-4xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tight">
          Bienvenid@ a DocuVerify
        </h2>
        <p className="text-center text-xl text-slate-600 dark:text-slate-300 mt-2 font-medium">
          Validación documental inteligente
        </p>
        <div
          className="w-full h-0.5 mt-8 rounded-full opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        ></div>
      </header>

      <main className="p-10 pt-0 max-w-5xl mx-auto flex flex-col gap-12">
        
        {/* Qué es */}
        <section
          className="flex items-center gap-12 p-8 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 transition-colors"
          style={{ backgroundColor: 'var(--color-card-bg)' }}
        >
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <HelpCircle style={{ color: 'var(--color-primary)' }} /> ¿Qué es?
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
              <strong>DocuVerify</strong> es una herramienta diseñada para apoyar la revisión de documentos jurídicos mediante reglas de validación y tecnologías de Inteligencia Artificial.
            </p>
          </div>
          <div
            className="w-64 h-64 rounded-full border-4 overflow-hidden shadow-md flex-shrink-0"
            style={{ borderColor: 'var(--color-primary)' }}
          >
            <img src={imagenQueEs} alt="Que es DocuVerify" className="w-full h-full object-cover" />
          </div>
        </section>

        {/* Objetivo */}
        <section
          className="flex items-center gap-12 p-8 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 flex-row-reverse transition-colors"
          style={{ backgroundColor: 'var(--color-card-bg)' }}
        >
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 text-right flex items-center justify-end gap-2">
              Objetivo <Target style={{ color: 'var(--color-primary)' }} />
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
              Analiza tu documento para identificar elementos requeridos, posibles inconsistencias y criterios que necesitan revisión, proporcionando observaciones y recomendaciones que facilitan el proceso de validación.
            </p>
          </div>
          <div
            className="w-64 h-64 rounded-full border-4 overflow-hidden shadow-md flex-shrink-0"
            style={{ borderColor: 'var(--color-primary)' }}
          >
            <img src={imagenObjetivo} alt="Objetivo" className="w-full h-full object-cover" />
          </div>
        </section>

        {/* Cómo funciona */}
        <section
          className="flex items-center gap-12 p-8 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 flex-row-reverse transition-colors"
          style={{ backgroundColor: 'var(--color-card-bg)' }}
        >
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 text-right flex items-center justify-end gap-2">
              Cómo funciona <Zap style={{ color: 'var(--color-primary)' }} />
            </h3>
            <div className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed text-justify space-y-3">
              <p>1. Carga tu documento — Sube el acuerdo de confidencialidad que deseas validar.</p>
              <p>2. Analiza el contenido — DocuVerify procesa el documento e identifica la información relevante.</p>
              <p>3. Aplica las reglas — El sistema verifica el documento mediante reglas de validación.</p>
              <p>4. Identifica puntos importantes — Se detectan las partes clave del documento.</p>
              <p>5. Consulta el resultado — Obtén un resumen con observaciones y un asistente de IA.</p>
            </div>
          </div>
          <div
            className="w-64 h-64 rounded-full border-4 overflow-hidden shadow-md flex-shrink-0"
            style={{ borderColor: 'var(--color-primary)' }}
          >
            <img src={imagenfunciona} alt="Como funciona" className="w-full h-full object-cover" />
          </div>
        </section>

      </main>
    </div>
  );
}

export default Inicio;