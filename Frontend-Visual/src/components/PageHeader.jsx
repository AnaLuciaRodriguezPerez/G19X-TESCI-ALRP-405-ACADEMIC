import React from 'react';

function PageHeader({ titulo, subtitulo }) {
  return (
    <header className="p-10 pb-6">
      <h2 className="text-4xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tight">
        {titulo}
      </h2>
      <p className="text-center text-xl text-slate-600 dark:text-slate-300 mt-2 font-medium">
        {subtitulo}
      </p>
      <div
        className="w-full h-0.5 mt-8 rounded-full opacity-50"
        style={{ backgroundColor: 'var(--color-primary)' }}
      ></div>
    </header>
  );
}

export default PageHeader;