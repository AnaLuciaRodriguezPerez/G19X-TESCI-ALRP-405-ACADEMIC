import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/sesion';
import Registro from './pages/Registro';
import Inicio from './pages/Inicio';
import AcuerdoConfidencialidad from './pages/AcuerdoConfidencialidad';
import Configuracion from './pages/Configuracion';
import Historial from './pages/Historial'; // 👈 1. IMPORTAMOS HISTORIAL
import Layout from './components/Layout';

// Protege las rutas: si NO hay sesión iniciada, regresa al login
function RutaProtegida({ children }) {
  const usuario = localStorage.getItem('usuario');
  return usuario ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas (sin Sidebar) */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas privadas (con Sidebar) */}
        <Route 
          element={
            <RutaProtegida>
              <Layout />
            </RutaProtegida>
          }
        >
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/acuerdo-confidencialidad" element={<AcuerdoConfidencialidad />} />
          <Route path="/historial" element={<Historial />} /> {/* 👈 2. AGREGAMOS LA RUTA */}
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;