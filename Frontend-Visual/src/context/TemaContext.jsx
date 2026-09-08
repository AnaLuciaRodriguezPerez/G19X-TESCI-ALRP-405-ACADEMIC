import React, { createContext, useContext, useState, useEffect } from 'react';

const TemaContext = createContext();

// Paletas SOLO para modo claro
export const TEMAS = {
  azul: {
    nombre: 'Azul',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    sidebar: '#0f172a',
    contentBg: '#f8fafc',
    cardBg: '#ffffff',
    swatch: 'bg-blue-600',
  },
  esmeralda: {
    nombre: 'Esmeralda',
    primary: '#059669',
    primaryHover: '#047857',
    sidebar: '#022c22',
    contentBg: '#f0fdf4',
    cardBg: '#ffffff',
    swatch: 'bg-emerald-600',
  },
  violeta: {
    nombre: 'Violeta',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    sidebar: '#1e1b4b',
    contentBg: '#f5f3ff',
    cardBg: '#ffffff',
    swatch: 'bg-violet-600',
  },
  rosa: {
    nombre: 'Rosa',
    primary: '#db2777',
    primaryHover: '#be185d',
    sidebar: '#4a044e',
    contentBg: '#fdf2f8',
    cardBg: '#ffffff',
    swatch: 'bg-pink-600',
  },
  naranja: {
    nombre: 'Naranja',
    primary: '#ea580c',
    primaryHover: '#c2410c',
    sidebar: '#431407',
    contentBg: '#fff7ed',
    cardBg: '#ffffff',
    swatch: 'bg-orange-600',
  },
};

// Colores FIJOS del modo oscuro (neutros, no se tiñen)
const OSCURO = {
  sidebar: '#020617',      // casi negro
  contentBg: '#0f172a',    // slate-900
  cardBg: '#1e293b',       // slate-800
  primary: '#3b82f6',      // azul suave solo para acentos
  primaryHover: '#2563eb',
};

export function TemaProvider({ children }) {
  const [color, setColor] = useState(localStorage.getItem('tema_color') || 'azul');
  const [modoOscuro, setModoOscuro] = useState(localStorage.getItem('tema_oscuro') === 'true');

  useEffect(() => {
    if (modoOscuro) {
      // ===== MODO OSCURO PURO (ignora el color elegido) =====
      document.documentElement.style.setProperty('--color-primary', OSCURO.primary);
      document.documentElement.style.setProperty('--color-primary-hover', OSCURO.primaryHover);
      document.documentElement.style.setProperty('--color-sidebar', OSCURO.sidebar);
      document.documentElement.style.setProperty('--color-content-bg', OSCURO.contentBg);
      document.documentElement.style.setProperty('--color-card-bg', OSCURO.cardBg);
      document.documentElement.classList.add('dark');
    } else {
      // ===== MODO CLARO (usa la paleta del color elegido) =====
      const tema = TEMAS[color] || TEMAS.azul;
      document.documentElement.style.setProperty('--color-primary', tema.primary);
      document.documentElement.style.setProperty('--color-primary-hover', tema.primaryHover);
      document.documentElement.style.setProperty('--color-sidebar', tema.sidebar);
      document.documentElement.style.setProperty('--color-content-bg', tema.contentBg);
      document.documentElement.style.setProperty('--color-card-bg', tema.cardBg);
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('tema_color', color);
    localStorage.setItem('tema_oscuro', modoOscuro);
  }, [color, modoOscuro]);

  return (
    <TemaContext.Provider value={{ color, setColor, modoOscuro, setModoOscuro, tema: TEMAS[color] }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}