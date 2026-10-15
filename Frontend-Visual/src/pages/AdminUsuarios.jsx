import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, ShieldAlert, Ban, CheckCircle, Trash2, Mail, Activity, Search } from 'lucide-react';
import { useTema } from '../context/TemaContext';
import PageHeader from '../components/PageHeader';

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const { modoOscuro } = useTema();

  const miUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/admin/usuarios', {
        params: { admin_id: miUsuario.id }
      });
      setUsuarios(res.data);
    } catch (err) {
      alert('Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (miUsuario.id) cargarUsuarios();
  }, [miUsuario.id]);

  const cambiarRol = async (id, rolActual) => {
    const nuevoRol = rolActual === 'admin' ? 'usuario' : 'admin';
    if (!window.confirm(`¿Seguro que deseas hacer a este usuario ${nuevoRol.toUpperCase()}?`)) return;
    
    try {
      await axios.put(`http://127.0.0.1:8000/api/admin/usuarios/${id}/rol`, null, {
        params: { nuevo_rol: nuevoRol, admin_id: miUsuario.id }
      });
      cargarUsuarios();
    } catch (err) { alert(err.response?.data?.detail || 'Error al cambiar rol'); }
  };

  const alternarBloqueo = async (id, estadoActual) => {
    const accion = estadoActual ? 'BLOQUEAR' : 'DESBLOQUEAR';
    if (!window.confirm(`¿Seguro que deseas ${accion} a este usuario?`)) return;

    try {
      await axios.put(`http://127.0.0.1:8000/api/admin/usuarios/${id}/estado`, null, {
        params: { activo: !estadoActual, admin_id: miUsuario.id }
      });
      cargarUsuarios();
    } catch (err) { alert(err.response?.data?.detail || 'Error al cambiar estado'); }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('⚠️ ADVERTENCIA: Esta acción es irreversible. ¿Eliminar usuario y todos sus análisis?')) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/usuarios/${id}`, {
        params: { admin_id: miUsuario.id }
      });
      cargarUsuarios();
    } catch (err) { alert(err.response?.data?.detail || 'Error al eliminar'); }
  };

  const reenviarCorreo = async (email) => {
    try {
      await axios.post('http://127.0.0.1:8000/reenviar-verificacion', { email });
      alert(`Correo de verificación enviado a ${email}`);
    } catch (err) { alert('No se pudo enviar el correo.'); }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cargando) return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <Activity className="animate-spin text-blue-600" size={48} />
    </div>
  );

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto transition-colors duration-300 ${modoOscuro ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <PageHeader
        titulo="Gestión de Usuarios"
        subtitulo="Administra accesos, roles y estados."
      />

      {/* CONTENIDO */}
      <main className="p-10 pt-0 w-full flex flex-col gap-8">
        {/* Buscador */}
        <div className="flex justify-end w-full">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              value={busqueda} 
              onChange={e => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${modoOscuro ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' : 'bg-white border-slate-300'}`}
            />
          </div>
        </div>

        <div className={`rounded-2xl shadow-sm border border-black/5 dark:border-white/10 overflow-hidden ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${modoOscuro ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100 text-slate-600'} text-sm uppercase tracking-wider`}>
                  <th className="p-4 font-semibold">Usuario</th>
                  <th className="p-4 font-semibold">Rol</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${modoOscuro ? 'divide-slate-700' : 'divide-slate-200'}`}>
                {usuariosFiltrados.map((u) => {
                  const esYoMismo = u.id === miUsuario.id;
                  
                  return (
                    <tr key={u.id} className={`hover:${modoOscuro ? 'bg-slate-700/30' : 'bg-slate-50'} transition-colors`}>
                      
                      <td className="p-4">
                        <p className="font-medium">{u.nombre} {u.apellidos}</p>
                        <p className={`text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-500'}`}>{u.email}</p>
                      </td>

                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.rol === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                          {u.rol.toUpperCase()}
                        </span>
                      </td>

                      <td className="p-4 flex flex-col gap-1 items-start">
                        {!u.activo ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-xs font-semibold rounded-md flex items-center gap-1"><Ban size={12}/> BLOQUEADO</span>
                        ) : u.email_verificado ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs font-semibold rounded-md flex items-center gap-1"><CheckCircle size={12}/> ACTIVO</span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 text-xs font-semibold rounded-md">PENDIENTE VERIFICAR</span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          
                          {!u.email_verificado && (
                            <button onClick={() => reenviarCorreo(u.email)} title="Reenviar Verificación" className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 rounded-lg transition-colors">
                              <Mail size={18} />
                            </button>
                          )}

                          <button disabled={esYoMismo} onClick={() => cambiarRol(u.id, u.rol)} title={u.rol === 'admin' ? "Quitar Admin" : "Hacer Admin"} className={`p-2 rounded-lg transition-colors ${esYoMismo ? 'opacity-30 cursor-not-allowed' : 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60'}`}>
                            {u.rol === 'admin' ? <ShieldAlert size={18} /> : <Shield size={18} />}
                          </button>

                          <button disabled={esYoMismo} onClick={() => alternarBloqueo(u.id, u.activo)} title={u.activo ? "Bloquear" : "Desbloquear"} className={`p-2 rounded-lg transition-colors ${esYoMismo ? 'opacity-30 cursor-not-allowed' : u.activo ? 'bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:hover:bg-orange-900/60' : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60'}`}>
                            {u.activo ? <Ban size={18} /> : <CheckCircle size={18} />}
                          </button>

                          <button disabled={esYoMismo} onClick={() => eliminarUsuario(u.id)} title="Eliminar Usuario" className={`p-2 rounded-lg transition-colors ${esYoMismo ? 'opacity-30 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60'}`}>
                            <Trash2 size={18} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {usuariosFiltrados.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">No se encontraron usuarios.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminUsuarios;