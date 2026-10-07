import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity } from 'lucide-react';

function AdminHistorial() {
  const [analisis, setAnalisis] = useState([]);
  const [cargando, setCargando] = useState(true);
  const miUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/admin/historial-global', { params: { admin_id: miUsuario.id } })
      .then(res => setAnalisis(res.data))
      .finally(() => setCargando(false));
  }, [miUsuario.id]);

  if (cargando) return <div>Cargando historial...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-4">Historial Global</h1>
      <table>
        <tbody>
          {analisis.map(a => (
            <tr key={a.id}>
              <td>{a.nombre_archivo}</td>
              <td>{a.email_usuario}</td>
              {/* ❌ No hay badges de riesgo con colores diferenciados */}
              <td>{a.riesgo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminHistorial;