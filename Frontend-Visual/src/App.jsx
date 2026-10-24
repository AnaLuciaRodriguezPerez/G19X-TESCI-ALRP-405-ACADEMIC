import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/sesion';
import Registro from './pages/Registro';
import Inicio from './pages/Inicio';
import AcuerdoConfidencialidad from './pages/AcuerdoConfidencialidad';
import Configuracion from './pages/Configuracion';
import Historial from './pages/Historial';
import Layout from './components/Layout';

import OlvideContrasena from './pages/OlvideContrasena';
import RestablecerContrasena from './pages/RestablecerContrasena';
import VerificarCorreo from './pages/VerificarCorreo';

import AdminDashboard from './pages/AdminDashboard';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminHistorial from './pages/AdminHistorial';
import AdminReglas from './pages/AdminReglas';

// Función para proteger rutas normales
function RutaProtegida({ children }) {
  const usuario = localStorage.getItem('usuario');
  return usuario ? children : <Navigate to="/" replace />;
}

// Función para proteger rutas exclusivas del admin
function RutaAdmin({ children }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (!usuario.email) return <Navigate to="/" replace />;
  if (usuario.rol !== 'admin') return <Navigate to="/inicio" replace />;
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>


        {/* Rutas públicas */}


        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
        <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
        <Route path="/verificar-correo" element={<VerificarCorreo />} />


        {/* RUTAS PRIVADAS (Todas tienen el Sidebar a través de Layout) */}


        <Route element={<RutaProtegida><Layout /></RutaProtegida>}>
          
          {/* Vistas de Usuario Normal */}
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/acuerdo-confidencialidad" element={<AcuerdoConfidencialidad />} />
          <Route path="/historial" element={<Historial />} />
          
          {/* Vista compartida (Admin y Usuarios pueden configurar su perfil) */}
          <Route path="/configuracion" element={<Configuracion />} />

          {/* Vistas exclusivas del Administrador */}
          <Route path="/admin/dashboard" element={
            <RutaAdmin>
              <AdminDashboard />
            </RutaAdmin>
          } />
          
          <Route path="/admin/usuarios" element={
            <RutaAdmin>
              <AdminUsuarios />
            </RutaAdmin>
          } />

          <Route path="/admin/historial" element={
            <RutaAdmin>
              <AdminHistorial />
            </RutaAdmin>
          } />

          <Route path="/admin/reglas" element={
            <RutaAdmin>
              <AdminReglas />
            </RutaAdmin>
          } />

        </Route>


         <Route path="*" element={<Navigate to="/" replace />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;