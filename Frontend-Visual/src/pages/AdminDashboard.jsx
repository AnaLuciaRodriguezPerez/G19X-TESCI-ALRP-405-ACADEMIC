import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, Activity } from 'lucide-react';
import { useTema } from '../context/TemaContext';
import { Bar, Doughnut } from 'react-chartjs-2';

function AdminDashboard() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { modoOscuro } = useTema();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/admin/estadisticas', { params: { admin_id: usuario.id } })
      .then(res => setEstadisticas(res.data))
      .catch(err => console.error(err))
      .finally(() => setCargando(false));
  }, [usuario.id]);

  if (cargando) return <div>Cargando...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-4">Panel General</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-xl shadow">
          <p>Total usuarios: {estadisticas?.total_usuarios}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          <p>Total análisis: {estadisticas?.total_analisis}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;