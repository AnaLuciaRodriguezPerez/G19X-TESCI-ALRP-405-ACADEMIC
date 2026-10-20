import React, { useState, useEffect } from 'react';
import api from '../api'; 
import { Scale, Plus, Edit, Trash2, Check, Activity, FilePlus, AlertCircle, CheckCircle, X, AlertTriangle, Save } from 'lucide-react';
import { useTema } from '../context/TemaContext';
import PageHeader from '../components/PageHeader';

function AdminReglas() {
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [reglas, setReglas] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormularioRegla, setMostrarFormularioRegla] = useState(false);
  const [mostrarFormularioTipo, setMostrarFormularioTipo] = useState(false);
  const [editandoRegla, setEditandoRegla] = useState(null);
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: 'exito' });
  const [modalConfirmacion, setModalConfirmacion] = useState({ mostrar: false, idRegla: null });
  const [modalConfirmacionGuardar, setModalConfirmacionGuardar] = useState({ mostrar: false, accion: null });
  const { modoOscuro } = useTema();

  const [formDataRegla, setFormDataRegla] = useState({
    nombre_clausula: '',
    criterio_evaluacion: '',
    es_obligatoria: true,
    tipo_documento_id: ''
  });

  const [formDataTipo, setFormDataTipo] = useState({
    nombre: '',
    descripcion: ''
  });

  const mostrarMensaje = (mensaje, tipo = 'exito') => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => { setNotificacion(prev => ({ ...prev, mostrar: false })); }, 3000);
  };

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const resTipos = await api.get('/api/admin/tipos-documento'); 
      setTiposDocumento(resTipos.data);
      if (resTipos.data.length > 0) {
        const idInicial = tipoSeleccionado || resTipos.data[0].id;
        setTipoSeleccionado(idInicial);
        setFormDataRegla(prev => ({ ...prev, tipo_documento_id: idInicial }));
        await cargarReglas(idInicial);
      } else {
        setReglas([]);
      }
    } catch (err) {
      console.error('Error al cargar datos', err);
      mostrarMensaje('Error al cargar la información', 'error');
    } finally {
      setCargando(false);
    }
  };

  const cargarReglas = async (tipoId) => {
    if (!tipoId) return;
    try {
      const res = await api.get('/api/admin/reglas', { 
        params: { tipo_documento_id: tipoId }
      });
      setReglas(res.data);
    } catch (err) {
      console.error('Error al cargar reglas', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (tipoSeleccionado) {
      cargarReglas(tipoSeleccionado);
      setFormDataRegla(prev => ({ ...prev, tipo_documento_id: tipoSeleccionado }));
    }
  }, [tipoSeleccionado]);

  const handleSubmitRegla = (e) => {
    e.preventDefault();
    setModalConfirmacionGuardar({ mostrar: true, accion: 'regla' });
  };

  const ejecutarGuardarRegla = async () => {
    setModalConfirmacionGuardar({ mostrar: false, accion: null });
    try {
      if (editandoRegla) {
        await api.put(`/api/admin/reglas/${editandoRegla.id}`, null, { 
          params: {
            nombre_clausula: formDataRegla.nombre_clausula,
            criterio_evaluacion: formDataRegla.criterio_evaluacion,
            es_obligatoria: formDataRegla.es_obligatoria
          }
        });
        mostrarMensaje('Regla actualizada correctamente', 'exito');
      } else {
        await api.post('/api/admin/reglas', null, { 
          params: {
            tipo_documento_id: formDataRegla.tipo_documento_id || tipoSeleccionado,
            nombre_clausula: formDataRegla.nombre_clausula,
            criterio_evaluacion: formDataRegla.criterio_evaluacion,
            es_obligatoria: formDataRegla.es_obligatoria
          }
        });
        mostrarMensaje('Regla creada correctamente', 'exito');
      }
      cancelarEdicionRegla();
      cargarReglas(tipoSeleccionado);
    } catch (err) {
      mostrarMensaje(err.response?.data?.detail || 'Error al guardar la regla', 'error');
    }
  };

  const handleSubmitTipo = (e) => {
    e.preventDefault();
    setModalConfirmacionGuardar({ mostrar: true, accion: 'tipo' });
  };

  const ejecutarGuardarTipo = async () => {
    setModalConfirmacionGuardar({ mostrar: false, accion: null });
    try {
      const res = await api.post('/api/admin/tipos-documento', null, { 
        params: { nombre: formDataTipo.nombre, descripcion: formDataTipo.descripcion }
      });
      mostrarMensaje('Tipo de documento registrado exitosamente', 'exito');
      setFormDataTipo({ nombre: '', descripcion: '' });
      setMostrarFormularioTipo(false);
      await cargarDatos();
      if (res.data?.id) setTipoSeleccionado(res.data.id);
    } catch (err) {
      mostrarMensaje(err.response?.data?.detail || 'Error al registrar', 'error');
    }
  };

  const editarRegla = (regla) => {
    setFormDataRegla({
      nombre_clausula: regla.nombre_clausula,
      criterio_evaluacion: regla.criterio_evaluacion,
      es_obligatoria: regla.es_obligatoria,
      tipo_documento_id: regla.tipo_documento_id
    });
    setEditandoRegla(regla);
    setMostrarFormularioRegla(true);
  };

  const solicitarEliminarRegla = (id) => { setModalConfirmacion({ mostrar: true, idRegla: id }); };

  const confirmarEliminacion = async () => {
    try {
      await api.delete(`/api/admin/reglas/${modalConfirmacion.idRegla}`); 
      mostrarMensaje('Regla eliminada exitosamente', 'exito');
      cargarReglas(tipoSeleccionado);
    } catch (err) {
      mostrarMensaje('Error al eliminar la regla', 'error');
    } finally {
      setModalConfirmacion({ mostrar: false, idRegla: null });
    }
  };

  const cancelarEdicionRegla = () => {
    setFormDataRegla({ nombre_clausula: '', criterio_evaluacion: '', es_obligatoria: true, tipo_documento_id: tipoSeleccionado || '' });
    setEditandoRegla(null);
    setMostrarFormularioRegla(false);
  };

  const obtenerNombreTipo = (tipoId) => {
    const t = tiposDocumento.find(item => item.id === tipoId);
    return t ? t.nombre : `ID: ${tipoId}`;
  };

  if (cargando) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center text-blue-600 gap-4">
          <Activity className="animate-spin" size={48} />
          <p className="font-semibold">Cargando reglas jurídicas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto transition-colors duration-300 ${modoOscuro ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {notificacion.mostrar && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 ${notificacion.tipo === 'exito' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {notificacion.tipo === 'exito' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <p className="font-semibold">{notificacion.mensaje}</p>
          <button onClick={() => setNotificacion({...notificacion, mostrar: false})} className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors"><X size={18} /></button>
        </div>
      )}

      <PageHeader titulo="Gestión de Reglas Jurídicas" subtitulo="Administra los tipos de documento y las reglas que usa la IA para validarlos." />

      <main className="p-10 pt-0 w-full flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="w-full lg:w-auto">
            <label className={`block text-sm font-semibold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>Tipo de documento a consultar:</label>
            <select value={tipoSeleccionado || ''} onChange={(e) => setTipoSeleccionado(Number(e.target.value))} className={`w-full lg:w-80 px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-colors font-semibold ${modoOscuro ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'}`}>
              {tiposDocumento.map(t => (<option key={t.id} value={t.id}>{t.nombre}</option>))}
            </select>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button onClick={() => setMostrarFormularioTipo(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-md"><FilePlus size={20} />Nuevo Tipo de Documento</button>
            <button onClick={() => { setMostrarFormularioRegla(true); setEditandoRegla(null); }} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md"><Plus size={20} />Nueva Regla</button>
          </div>
        </div>

        {modalConfirmacionGuardar.mostrar && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalConfirmacionGuardar({mostrar: false, accion: null})} />
            <div className={`relative rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center rounded-full mb-4"><Save size={32} /></div>
              <h3 className="text-xl font-black mb-2">¿Guardar cambios?</h3>
              <p className={`mb-6 ${modoOscuro ? 'text-slate-300' : 'text-slate-600'}`}>{modalConfirmacionGuardar.accion === 'regla' ? '¿Estás seguro de que deseas guardar esta regla jurídica en el sistema?' : '¿Estás seguro de que deseas registrar este nuevo tipo de documento?'}</p>
              <div className="flex gap-3">
                <button onClick={() => setModalConfirmacionGuardar({mostrar: false, accion: null})} className={`flex-1 py-3 font-bold rounded-xl transition-colors ${modoOscuro ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}>Revisar</button>
                <button onClick={modalConfirmacionGuardar.accion === 'regla' ? ejecutarGuardarRegla : ejecutarGuardarTipo} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md">Sí, guardar</button>
              </div>
            </div>
          </div>
        )}

        {modalConfirmacion.mostrar && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalConfirmacion({mostrar: false, idRegla: null})} />
            <div className={`relative rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center rounded-full mb-4"><AlertTriangle size={32} /></div>
              <h3 className="text-xl font-black mb-2">¿Eliminar regla?</h3>
              <p className={`mb-6 ${modoOscuro ? 'text-slate-300' : 'text-slate-600'}`}>Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta regla jurídica?</p>
              <div className="flex gap-3">
                <button onClick={() => setModalConfirmacion({mostrar: false, idRegla: null})} className={`flex-1 py-3 font-bold rounded-xl transition-colors ${modoOscuro ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}>Cancelar</button>
                <button onClick={confirmarEliminacion} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-md">Sí, eliminar</button>
              </div>
            </div>
          </div>
        )}

        {mostrarFormularioTipo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMostrarFormularioTipo(false)} />
            <div className={`relative rounded-2xl shadow-2xl p-8 w-full max-w-lg ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><FilePlus className="text-emerald-500" />Nuevo Tipo de Documento</h2>
              <form onSubmit={handleSubmitTipo} className="space-y-5">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>Nombre del Documento *</label>
                  <input type="text" required value={formDataTipo.nombre} onChange={(e) => setFormDataTipo({...formDataTipo, nombre: e.target.value})} placeholder="Ej: Contrato de Arrendamiento" className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${modoOscuro ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>Descripción</label>
                  <textarea rows="3" value={formDataTipo.descripcion} onChange={(e) => setFormDataTipo({...formDataTipo, descripcion: e.target.value})} placeholder="Breve descripción..." className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none resize-none ${modoOscuro ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300'}`} />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setMostrarFormularioTipo(false)} className={`flex-1 py-3 font-bold rounded-xl transition-colors ${modoOscuro ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}>Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-md">Registrar Tipo</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {mostrarFormularioRegla && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={cancelarEdicionRegla} />
            <div className={`relative rounded-2xl shadow-2xl p-8 w-full max-w-2xl ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-black mb-6">{editandoRegla ? 'Editar Regla Jurídica' : 'Nueva Regla Jurídica'}</h2>
              <form onSubmit={handleSubmitRegla} className="space-y-5">
                {!editandoRegla && (
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>¿A qué tipo de documento pertenece esta regla? *</label>
                    <select value={formDataRegla.tipo_documento_id} onChange={(e) => setFormDataRegla({...formDataRegla, tipo_documento_id: Number(e.target.value)})} className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none font-semibold ${modoOscuro ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'}`}>
                      {tiposDocumento.map(t => (<option key={t.id} value={t.id}>{t.nombre}</option>))}
                    </select>
                  </div>
                )}
                <div>
                  <label className={`block text-sm font-bold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>Nombre de la Cláusula *</label>
                  <input type="text" required value={formDataRegla.nombre_clausula} onChange={(e) => setFormDataRegla({...formDataRegla, nombre_clausula: e.target.value})} placeholder="Ej: Depósito en Garantía" className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${modoOscuro ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>Criterio de Evaluación *</label>
                  <textarea required rows="4" value={formDataRegla.criterio_evaluacion} onChange={(e) => setFormDataRegla({...formDataRegla, criterio_evaluacion: e.target.value})} placeholder="Describe qué debe verificar la IA..." className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none resize-none ${modoOscuro ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>¿Es obligatoria?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="es_obligatoria" checked={formDataRegla.es_obligatoria === true} onChange={() => setFormDataRegla({...formDataRegla, es_obligatoria: true})} className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-green-600 dark:text-green-400">Sí, obligatoria</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="es_obligatoria" checked={formDataRegla.es_obligatoria === false} onChange={() => setFormDataRegla({...formDataRegla, es_obligatoria: false})} className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">Recomendada</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={cancelarEdicionRegla} className={`flex-1 py-3 font-bold rounded-xl transition-colors ${modoOscuro ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}>Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md">{editandoRegla ? 'Actualizar Regla' : 'Guardar Regla'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className={`rounded-2xl shadow-sm border border-black/5 dark:border-white/10 overflow-hidden ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${modoOscuro ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100 text-slate-600'} text-sm uppercase tracking-wider`}>
                  <th className="p-4 font-semibold">Cláusula</th>
                  <th className="p-4 font-semibold">Tipo de Documento</th>
                  <th className="p-4 font-semibold text-center">Obligatoria</th>
                  <th className="p-4 font-semibold">Criterio</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${modoOscuro ? 'divide-slate-700' : 'divide-slate-200'}`}>
                {reglas.map((r) => (
                  <tr key={r.id} className={`hover:${modoOscuro ? 'bg-slate-700/30' : 'bg-slate-50'} transition-colors`}>
                    <td className="p-4"><span className="font-bold text-base">{r.nombre_clausula}</span></td>
                    <td className="p-4"><span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${modoOscuro ? 'bg-blue-900/40 text-blue-300 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>{obtenerNombreTipo(r.tipo_documento_id)}</span></td>
                    <td className="p-4 text-center">
                      {r.es_obligatoria ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-1"><Check size={14} /> Sí</span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-1"><Scale size={14} /> Recomendada</span>
                      )}
                    </td>
                    <td className="p-4"><p className={`text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-600'} line-clamp-2`}>{r.criterio_evaluacion}</p></td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => editarRegla(r)} className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 rounded-lg transition-colors" title="Editar"><Edit size={18} /></button>
                        <button onClick={() => solicitarEliminarRegla(r.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60 rounded-lg transition-colors" title="Eliminar"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reglas.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">No hay reglas jurídicas registradas para este tipo de documento.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminReglas;