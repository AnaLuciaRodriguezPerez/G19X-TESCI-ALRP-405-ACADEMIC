import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Scale, Plus, Edit, Trash2, Check, Activity, FilePlus } from 'lucide-react';
import { useTema } from '../context/TemaContext';
import PageHeader from '../components/PageHeader';

function AdminReglas() {
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [reglas, setReglas] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  // Modales
  const [mostrarFormularioRegla, setMostrarFormularioRegla] = useState(false);
  const [mostrarFormularioTipo, setMostrarFormularioTipo] = useState(false);
  const [editandoRegla, setEditandoRegla] = useState(null);
  
  const { modoOscuro } = useTema();
  const miUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Estado formulario de REGLAS
  const [formDataRegla, setFormDataRegla] = useState({
    nombre_clausula: '',
    criterio_evaluacion: '',
    es_obligatoria: true,
    tipo_documento_id: ''
  });

  // Estado formulario de NUEVO TIPO DE DOCUMENTO
  const [formDataTipo, setFormDataTipo] = useState({
    nombre: '',
    descripcion: ''
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const resTipos = await axios.get('http://127.0.0.1:8000/api/admin/tipos-documento', {
        params: { admin_id: miUsuario.id }
      });
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
    } finally {
      setCargando(false);
    }
  };

  const cargarReglas = async (tipoId) => {
    if (!tipoId) return;
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/admin/reglas', {
        params: { admin_id: miUsuario.id, tipo_documento_id: tipoId }
      });
      setReglas(res.data);
    } catch (err) {
      console.error('Error al cargar reglas', err);
    }
  };

  useEffect(() => {
    if (miUsuario.id) cargarDatos();
  }, [miUsuario.id]);

  useEffect(() => {
    if (tipoSeleccionado) {
      cargarReglas(tipoSeleccionado);
      setFormDataRegla(prev => ({ ...prev, tipo_documento_id: tipoSeleccionado }));
    }
  }, [tipoSeleccionado]);

  // -----------------------------------------------------
  // GUARDAR / EDITAR REGLA JURÍDICA
  // -----------------------------------------------------
  const handleSubmitRegla = async (e) => {
    e.preventDefault();
    try {
      if (editandoRegla) {
        await axios.put(`http://127.0.0.1:8000/api/admin/reglas/${editandoRegla.id}`, null, {
          params: {
            admin_id: miUsuario.id,
            nombre_clausula: formDataRegla.nombre_clausula,
            criterio_evaluacion: formDataRegla.criterio_evaluacion,
            es_obligatoria: formDataRegla.es_obligatoria
          }
        });
        alert('Regla actualizada correctamente');
      } else {
        await axios.post('http://127.0.0.1:8000/api/admin/reglas', null, {
          params: {
            admin_id: miUsuario.id,
            tipo_documento_id: formDataRegla.tipo_documento_id || tipoSeleccionado,
            nombre_clausula: formDataRegla.nombre_clausula,
            criterio_evaluacion: formDataRegla.criterio_evaluacion,
            es_obligatoria: formDataRegla.es_obligatoria
          }
        });
        alert('Regla creada correctamente');
      }
      
      cancelarEdicionRegla();
      cargarReglas(tipoSeleccionado);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al guardar la regla');
    }
  };

  // -----------------------------------------------------
  // GUARDAR NUEVO TIPO DE DOCUMENTO
  // -----------------------------------------------------
  const handleSubmitTipo = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/admin/tipos-documento', null, {
        params: {
          admin_id: miUsuario.id,
          nombre: formDataTipo.nombre,
          descripcion: formDataTipo.descripcion
        }
      });
      alert('Tipo de documento registrado exitosamente');
      setFormDataTipo({ nombre: '', descripcion: '' });
      setMostrarFormularioTipo(false);
      
      // Recargar la lista y seleccionar el nuevo
      await cargarDatos();
      if (res.data?.id) {
        setTipoSeleccionado(res.data.id);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al registrar el tipo de documento');
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

  const eliminarRegla = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta regla jurídica?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/reglas/${id}`, {
        params: { admin_id: miUsuario.id }
      });
      alert('Regla eliminada');
      cargarReglas(tipoSeleccionado);
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const cancelarEdicionRegla = () => {
    setFormDataRegla({
      nombre_clausula: '',
      criterio_evaluacion: '',
      es_obligatoria: true,
      tipo_documento_id: tipoSeleccionado || ''
    });
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
      
      <PageHeader
        titulo="Gestión de Reglas Jurídicas"
        subtitulo="Administra los tipos de documento y las reglas que usa la IA para validarlos."
      />

      {/* CONTENIDO */}
      <main className="p-10 pt-0 w-full flex flex-col gap-8">
        
        {/* BARRA SUPERIOR: Selector + Botones de Acción */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Selector de Tipo de Documento */}
          <div className="w-full lg:w-auto">
            <label className={`block text-sm font-semibold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>
              Tipo de documento a consultar:
            </label>
            <select
              value={tipoSeleccionado || ''}
              onChange={(e) => setTipoSeleccionado(Number(e.target.value))}
              className={`w-full lg:w-80 px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-colors font-semibold ${modoOscuro ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
            >
              {tiposDocumento.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>
          
          {/* Botones */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setMostrarFormularioTipo(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-md"
            >
              <FilePlus size={20} />
              Nuevo Tipo de Documento
            </button>

            <button
              onClick={() => { setMostrarFormularioRegla(true); setEditandoRegla(null); }}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md"
            >
              <Plus size={20} />
              Nueva Regla
            </button>
          </div>
        </div>

        {/* MODAL 1: REGISTRAR NUEVO TIPO DE DOCUMENTO */}
        {mostrarFormularioTipo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMostrarFormularioTipo(false)} />
            <div className={`relative rounded-2xl shadow-2xl p-8 w-full max-w-lg ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <FilePlus className="text-emerald-500" />
                Nuevo Tipo de Documento
              </h2>
              
              <form onSubmit={handleSubmitTipo} className="space-y-5">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>
                    Nombre del Documento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDataTipo.nombre}
                    onChange={(e) => setFormDataTipo({...formDataTipo, nombre: e.target.value})}
                    placeholder="Ej: Contrato de Arrendamiento"
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${modoOscuro ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>
                    Descripción
                  </label>
                  <textarea
                    rows="3"
                    value={formDataTipo.descripcion}
                    onChange={(e) => setFormDataTipo({...formDataTipo, descripcion: e.target.value})}
                    placeholder="Breve descripción de este tipo de documento legal..."
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none resize-none ${modoOscuro ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300'}`}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setMostrarFormularioTipo(false)}
                    className={`flex-1 py-3 font-bold rounded-xl transition-colors ${modoOscuro ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                  >
                    Registrar Tipo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: CREAR / EDITAR REGLA JURÍDICA */}
        {mostrarFormularioRegla && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={cancelarEdicionRegla} />
            <div className={`relative rounded-2xl shadow-2xl p-8 w-full max-w-2xl ${modoOscuro ? 'bg-slate-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-black mb-6">
                {editandoRegla ? 'Editar Regla Jurídica' : 'Nueva Regla Jurídica'}
              </h2>
              
              <form onSubmit={handleSubmitRegla} className="space-y-5">
                
                {/* SELECTOR DE TIPO DENTRO DEL FORMULARIO */}
                {!editandoRegla && (
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>
                      ¿A qué tipo de documento pertenece esta regla? *
                    </label>
                    <select
                      value={formDataRegla.tipo_documento_id}
                      onChange={(e) => setFormDataRegla({...formDataRegla, tipo_documento_id: Number(e.target.value)})}
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none font-semibold ${modoOscuro ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                    >
                      {tiposDocumento.map(t => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-bold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>
                    Nombre de la Cláusula *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDataRegla.nombre_clausula}
                    onChange={(e) => setFormDataRegla({...formDataRegla, nombre_clausula: e.target.value})}
                    placeholder="Ej: Depósito en Garantía"
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${modoOscuro ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>
                    Criterio de Evaluación *
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formDataRegla.criterio_evaluacion}
                    onChange={(e) => setFormDataRegla({...formDataRegla, criterio_evaluacion: e.target.value})}
                    placeholder="Describe qué debe verificar la IA en esta cláusula para considerarla válida..."
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none resize-none ${modoOscuro ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 ${modoOscuro ? 'text-slate-300' : 'text-slate-700'}`}>
                    ¿Es obligatoria?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="es_obligatoria"
                        checked={formDataRegla.es_obligatoria === true}
                        onChange={() => setFormDataRegla({...formDataRegla, es_obligatoria: true})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="font-semibold text-green-600 dark:text-green-400">Sí, obligatoria</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="es_obligatoria"
                        checked={formDataRegla.es_obligatoria === false}
                        onChange={() => setFormDataRegla({...formDataRegla, es_obligatoria: false})}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">Recomendada</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelarEdicionRegla}
                    className={`flex-1 py-3 font-bold rounded-xl transition-colors ${modoOscuro ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                  >
                    {editandoRegla ? 'Actualizar Regla' : 'Guardar Regla'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TABLA DE REGLAS JURÍDICAS */}
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
                    
                    <td className="p-4">
                      <span className="font-bold text-base">{r.nombre_clausula}</span>
                    </td>

                    {/* MUESTRA EL NOMBRE DEL TIPO EN LUGAR DE "TIPO ID: 1" */}
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${modoOscuro ? 'bg-blue-900/40 text-blue-300 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                        {obtenerNombreTipo(r.tipo_documento_id)}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      {r.es_obligatoria ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-1">
                          <Check size={14} /> Sí
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-1">
                          <Scale size={14} /> Recomendada
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <p className={`text-sm ${modoOscuro ? 'text-slate-400' : 'text-slate-600'} line-clamp-2`}>
                        {r.criterio_evaluacion}
                      </p>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => editarRegla(r)}
                          className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => eliminarRegla(r.id)}
                          className="p-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
            
            {reglas.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No hay reglas jurídicas registradas para este tipo de documento.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminReglas;