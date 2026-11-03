import React from 'react';

export default function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  icono,
  fondoIcono = 'bg-red-100',
  colorBoton = 'bg-red-600 hover:bg-red-700',
  textoAceptar = 'Sí',
  onAceptar,
  onCancelar,
  modoOscuro = false
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onCancelar} 
      />

      <div 
        className="relative rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 z-10"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          color: modoOscuro ? '#fff' : '#0f172a'
        }}
      >
        <div className="flex flex-col items-center text-center">
        
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${fondoIcono}`}>
            {icono}
          </div>

        
          <h3 className="text-2xl font-black mb-2">{titulo}</h3>
          <p className="mb-8 leading-relaxed opacity-70">{mensaje}</p>

        
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onCancelar}
              className="flex-1 py-3 font-bold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onAceptar}
              className={`flex-1 py-3 text-white font-bold rounded-xl transition-colors ${colorBoton}`}
            >
              {textoAceptar}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}