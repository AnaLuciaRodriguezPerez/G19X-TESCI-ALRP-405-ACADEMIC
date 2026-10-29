import React, { useState, useEffect } from 'react';
import api from '../api'; 
import { Shield, ShieldAlert, Ban, CheckCircle, Trash2, Mail, Activity, Search, Loader2 } from 'lucide-react';
import { useTema } from '../context/TemaContext';
import PageHeader from '../components/PageHeader';

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [enviandoCorreoId, setEnviandoCorreoId] = useState(null);


  const [modalBloqueo, setModalBloqueo] = useState({ abierto: false, id: null, estadoActual: false });
  
  
  const { modoOscuro } = useTema();

  const miUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const res = await api.get('/api/admin/usuarios'); 
      setUsuarios(res.data);
    } catch (err) {
      alert('Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cambiarRol = async (id, rolActual) => {
    const nuevoRol = rolActual === 'admin' ? 'usuario' : 'admin';
    if (!window.confirm(`¿Seguro que deseas hacer a este usuario ${nuevoRol.toUpperCase()}?`)) return;
    
    try {
      await api.put(`/api/admin/usuarios/${id}/rol`, null, { 
        params: { nuevo_rol: nuevoRol }
      });
      cargarUsuarios();
    } catch (err) { alert(err.response?.data?.detail || 'Error al cambiar rol'); }
  };

  //  bloquear o desbloquear usuarios

  const solicitarAlternarBloqueo = (id, estadoActual) => {
    setModalBloqueo({ abierto: true, id, estadoActual });
  };

  const confirmarAlternarBloqueo = async () => {
    const { id, estadoActual } = modalBloqueo;
    try {
      await api.put(`/api/admin/usuarios/${id}/estado`, null, {
        params: { activo: !estadoActual }
      });
      cargarUsuarios();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al cambiar estado');
    } finally {
      setModalBloqueo({ abierto: false, id: null, estadoActual: false });
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('ADVERTENCIA: Esta acción es irreversible. ¿Eliminar usuario y todos sus análisis?')) return;

    try {
      await api.delete(`/api/admin/usuarios/${id}`);
      cargarUsuarios();
    } catch (err) { alert(err.response?.data?.detail || 'Error al eliminar'); }
  };

  const reenviarCorreo = async (id, email) => {
    try {
      setEnviandoCorreoId(id);
      const res = await api.post(`/api/admin/usuarios/${id}/reenviar-verificacion`);
      alert(res.data?.mensaje || `Correo de verificación reenviado a ${email}`);
    } catch (err) {
      alert(err.response?.data?.detail || 'No se pudo enviar el correo de verificación.');
    } finally {
      setEnviandoCorreoId(null);
    }
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
      <PageHeader titulo="Gestión de Usuarios" subtitulo="Administra accesos, roles y estados." />
      <main className="p-10 pt-0 w-full flex flex-col gap-8">
        <div className="flex justify-end w-full">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Buscar por nombre o correo..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${modoOscuro ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' : 'bg-white border-slate-300'}`} />
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
                  const estaEnviando = enviandoCorreoId === u.id;

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
                            <button 
                              disabled={estaEnviando}
                              onClick={() => reenviarCorreo(u.id, u.email)} 
                              title="Reenviar Verificación" 
                              className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {estaEnviando ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Mail size={18} />
                              )}
                            </button>
                          )}
                          <button disabled={esYoMismo} onClick={() => cambiarRol(u.id, u.rol)} title={u.rol === 'admin' ? "Quitar Admin" : "Hacer Admin"} className={`p-2 rounded-lg transition-colors ${esYoMismo ? 'opacity-30 cursor-not-allowed' : 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60'}`}>
                            {u.rol === 'admin' ? <ShieldAlert size={18} /> : <Shield size={18} />}
                          </button>
                          <button disabled={esYoMismo} onClick={() => solicitarAlternarBloqueo(u.id, u.activo)} title={u.activo ? "Bloquear" : "Desbloquear"} className={`p-2 rounded-lg transition-colors ${esYoMismo ? 'opacity-30 cursor-not-allowed' : u.activo ? 'bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:hover:bg-orange-900/60' : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60'}`}>
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


      {modalBloqueo.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalBloqueo({ abierto: false, id: null, estadoActual: false })}
          />
          <div
            className="relative rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
            style={{ backgroundColor: 'var(--color-card-bg)', color: modoOscuro ? '#fff' : '#0f172a' }}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${modalBloqueo.estadoActual ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                {modalBloqueo.estadoActual ? (
                  <Ban size={30} className="text-orange-600" />
                ) : (
                  <CheckCircle size={30} className="text-green-600" />
                )}
              </div>

              <h3 className="text-2xl font-black mb-2">
                {modalBloqueo.estadoActual ? '¿Bloquear usuario?' : '¿Desbloquear usuario?'}
              </h3>

              <p className="mb-8 leading-relaxed opacity-70">
                {modalBloqueo.estadoActual
                  ? '¿Seguro que deseas BLOQUEAR a este usuario? No podrá acceder al sistema.'
                  : '¿Seguro que deseas DESBLOQUEAR a este usuario? Recuperará el acceso.'}
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setModalBloqueo({ abierto: false, id: null, estadoActual: false })}
                  className="flex-1 py-3 font-bold rounded-xl bg-slate-200 dark:bg-slate-600 hover:opacity-80 transition-opacity"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarAlternarBloqueo}
                  className={`flex-1 py-3 text-white font-bold rounded-xl transition-colors ${modalBloqueo.estadoActual ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  {modalBloqueo.estadoActual ? 'Sí, bloquear' : 'Sí, desbloquear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsuarios;