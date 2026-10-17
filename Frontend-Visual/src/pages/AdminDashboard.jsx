import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, CheckCircle, Scale, Activity, Layers } from 'lucide-react';
import { useTema } from '../context/TemaContext';
import PageHeader from '../components/PageHeader';

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, Filler
} from 'chart.js';
import { Bar, Doughnut, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, Filler);

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

  if (cargando) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 text-blue-600">
        <Activity className="animate-spin mr-3" size={32} /> Cargando métricas...
      </div>
    );
  }

  const textColor = modoOscuro ? '#cbd5e1' : '#475569';
  const gridColor = modoOscuro ? '#334155' : '#e2e8f0';

  // gráfica de Cuentas
  const datosDona = {
    labels: ['Verificadas', 'Pendientes'],
    datasets: [{
      data: [estadisticas?.usuarios_verificados, estadisticas?.usuarios_no_verificados],
      backgroundColor: ['#22c55e', modoOscuro ? '#475569' : '#cbd5e1'],
      borderWidth: 0,
    }],
  };

  // gráfica de análisis general
  const datosLinea = {
    labels: estadisticas?.grafico_meses || [],
    datasets: [{
      label: 'Documentos procesados',
      data: estadisticas?.grafico_valores || [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.4,
    }],
  };

  // gráfica de nivel de riesgo
  const datosPastel = {
    labels: estadisticas?.grafico_riesgos_labels || [],
    datasets: [{
      data: estadisticas?.grafico_riesgos_valores || [],
      backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#94a3b8'],
      borderWidth: 0,
    }],
  };

  // gráficas de cláusulas faltantes
  const datosBarras = {
    labels: estadisticas?.grafico_clausulas_labels || [],
    datasets: [{
      label: 'Veces ausente',
      data: estadisticas?.grafico_clausulas_valores || [],
      backgroundColor: '#f97316',
      borderRadius: 6,
    }],
  };

  // NUEVA: gráfica de análisis por TIPO DE DOCUMENTO
  const datosTipos = {
    labels: estadisticas?.grafico_tipos_labels || [],
    datasets: [{
      label: 'Cantidad Analizada',
      data: estadisticas?.grafico_tipos_valores || [],
      backgroundColor: '#14b8a6', // Color Teal para diferenciarlo
      borderRadius: 6,
    }],
  };

  const opcionesBase = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: textColor } } }
  };

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto transition-colors duration-300 ${modoOscuro ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <PageHeader
        titulo="Panel General"
        subtitulo="Métricas avanzadas de IA y Plataforma."
      />

      <main className="p-10 pt-0 w-full flex flex-col gap-6">

        {/* --- TARJETAS SUPERIORES (Ahora son 5) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <div className={`p-6 rounded-2xl shadow-lg border-t-4 border-blue-500 ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
            <p className={`text-sm font-bold mb-1 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>TOTAL USUARIOS</p>
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-black">{estadisticas?.total_usuarios}</h3>
              <Users size={28} className="text-blue-500" />
            </div>
          </div>
          <div className={`p-6 rounded-2xl shadow-lg border-t-4 border-green-500 ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
            <p className={`text-sm font-bold mb-1 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>CUENTAS ACTIVAS</p>
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-black">{estadisticas?.usuarios_verificados}</h3>
              <CheckCircle size={28} className="text-green-500" />
            </div>
          </div>
          <div className={`p-6 rounded-2xl shadow-lg border-t-4 border-purple-500 ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
            <p className={`text-sm font-bold mb-1 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>DOCS. ANALIZADOS</p>
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-black">{estadisticas?.total_analisis}</h3>
              <FileText size={28} className="text-purple-500" />
            </div>
          </div>
          <div className={`p-6 rounded-2xl shadow-lg border-t-4 border-orange-500 ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
            <p className={`text-sm font-bold mb-1 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>REGLAS I.A.</p>
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-black">{estadisticas?.total_reglas}</h3>
              <Scale size={28} className="text-orange-500" />
            </div>
          </div>
          {/* NUEVA TARJETA: Tipos de Documento */}
          <div className={`p-6 rounded-2xl shadow-lg border-t-4 border-teal-500 ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
            <p className={`text-sm font-bold mb-1 ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>TIPOS DE DOCS.</p>
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-black">{estadisticas?.total_tipos_documento || 0}</h3>
              <Layers size={28} className="text-teal-500" />
            </div>
          </div>
        </div>

        {/* --- PRIMERA FILA DE GRÁFICAS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl shadow-lg ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
            <h3 className="text-lg font-bold mb-4">Estado de Usuarios</h3>
            <div className="h-64"><Doughnut data={datosDona} options={{...opcionesBase, cutout: '70%'}} /></div>
          </div>
          <div className={`p-6 rounded-2xl shadow-lg lg:col-span-2 ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
            <h3 className="text-lg font-bold mb-4">Crecimiento de Análisis (Anual)</h3>
            <div className="h-64">
              <Line data={datosLinea} options={{...opcionesBase, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } }, x: { grid: { display: false }, ticks: { color: textColor } } } }} />
            </div>
          </div>
        </div>

        {/* --- SEGUNDA FILA DE GRÁFICAS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl shadow-lg ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
            <h3 className="text-lg font-bold mb-4">Diagnóstico General (Riesgo)</h3>
            <div className="h-64"><Pie data={datosPastel} options={opcionesBase} /></div>
          </div>
          <div className={`p-6 rounded-2xl shadow-lg lg:col-span-2 ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
            <h3 className="text-lg font-bold mb-4">Top 5 Cláusulas Faltantes (Problemas Frecuentes)</h3>
            <div className="h-64 flex flex-col justify-center">
              {estadisticas?.grafico_clausulas_labels?.length > 0 ? (
                <Bar data={datosBarras} options={{...opcionesBase, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } }, y: { grid: { display: false }, ticks: { color: textColor } } } }} />
              ) : (
                <p className="text-center text-slate-500 italic">Aún no hay suficientes datos de IA.</p>
              )}
            </div>
          </div>
        </div>

        {/* --- TERCERA FILA (NUEVA): ANÁLISIS POR TIPO DE DOCUMENTO --- */}
        <div className={`p-6 rounded-2xl shadow-lg w-full ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className="text-lg font-bold mb-4">Documentos Analizados por Tipo</h3>
          <div className="h-72 flex flex-col justify-center">
            {estadisticas?.grafico_tipos_labels?.length > 0 ? (
              <Bar 
                data={datosTipos} 
                options={{
                  ...opcionesBase, 
                  plugins: { legend: { display: false } }, 
                  scales: { 
                    y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } }, 
                    x: { grid: { display: false }, ticks: { color: textColor } } 
                  } 
                }} 
              />
            ) : (
              <p className="text-center text-slate-500 italic">No hay documentos analizados por tipo aún.</p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default AdminDashboard;