import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminReglas() {
  const [reglas, setReglas] = useState([]);
  const miUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/admin/reglas', { params: { admin_id: miUsuario.id, tipo_documento_id: 1 } })
      .then(res => setReglas(res.data));
  }, [miUsuario.id]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-4">Reglas Jurídicas</h1>
      <ul>
        {reglas.map(r => (
          <li key={r.id}>{r.nombre_clausula}</li>
        ))}
      </ul>
    </div>
  );
}

export default AdminReglas;