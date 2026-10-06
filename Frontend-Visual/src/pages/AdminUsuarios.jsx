import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity } from 'lucide-react';

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const miUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/admin/usuarios', { params: { admin_id: miUsuario.id } })
      .then(res => setUsuarios(res.data))
      .finally(() => setCargando(false));
  }, [miUsuario.id]);

  const eliminar = (id) => {
    axios.delete(`http://127.0.0.1:8000/api/admin/usuarios/${id}`, { params: { admin_id: miUsuario.id } });
  };

  if (cargando) return <p>Cargando usuarios...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-4">Gestión de Usuarios</h1>
      <ul>
        {usuarios.map(u => (
          <li key={u.id} className="mb-2">
            {u.nombre} - {u.email} 
            <button onClick={() => eliminar(u.id)} className="ml-4 text-red-500">Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminUsuarios;