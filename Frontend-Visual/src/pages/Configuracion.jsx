import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  User,
  Palette,
  Check,
  Moon,
  Sun,
  Camera,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
import api from '../api';
import { useTema, TEMAS } from '../context/TemaContext';

function Configuracion() {
  const { color, setColor, modoOscuro, setModoOscuro } = useTema();
  const fileInputRef = useRef(null);

  const [mostrarConfigurar, setMostrarConfigurar] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarAvanzado, setMostrarAvanzado] = useState(false);

  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario')) || {};

  // Datos de solo lectura (panel principal)
  const [nombre, setNombre] = useState(usuarioGuardado.nombre || '');
  const [apellidoPaterno, setApellidoPaterno] = useState(usuarioGuardado.apellido_paterno || '');
  const [apellidoMaterno, setApellidoMaterno] = useState(usuarioGuardado.apellido_materno || '');
  const [email, setEmail] = useState(usuarioGuardado.email || '');
  const [foto, setFoto] = useState(usuarioGuardado.foto || '');

  // Datos del modal
  const [nombreEd, setNombreEd] = useState('');
  const [apellidoPEd, setApellidoPEd] = useState('');
  const [apellidoMEd, setApellidoMEd] = useState('');
  const [passwordEd, setPasswordEd] = useState('');
  const [confirmPasswordEd, setConfirmPasswordEd] = useState('');
  const [fotoEd, setFotoEd] = useState('');
  const [fotoArchivo, setFotoArchivo] = useState(null);

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const inputGray =
    'w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg outline-none bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed transition-all';
  const inputEdit =
    'w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500';

  useEffect(() => {
    if (!mensaje && !error) return;
    const t = setTimeout(() => {
      setMensaje('');
      setError('');
    }, 4000);
    return () => clearTimeout(t);
  }, [mensaje, error]);

  const abrirConfigurar = () => {
    setNombreEd(nombre);
    setApellidoPEd(apellidoPaterno);
    setApellidoMEd(apellidoMaterno);
    setFotoEd(foto);
    setFotoArchivo(null);
    setPasswordEd('');
    setConfirmPasswordEd('');
    setMostrarAvanzado(false);
    setError('');
    setMensaje('');
    setMostrarConfigurar(true);
  };

  const seleccionarFoto = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setFotoArchivo(archivo);
    setFotoEd(URL.createObjectURL(archivo));
    e.target.value = '';
  };

  // Solo contraseña 
  const hayCambioSensible = passwordEd && passwordEd.length > 0;

  const pedirConfirmacion = () => {
    if (!nombreEd || !apellidoPEd) {
      setError('Nombre y apellido paterno son obligatorios.');
      return;
    }
    if (mostrarAvanzado) {
      if (passwordEd && passwordEd !== confirmPasswordEd) {
        setError('Las contraseñas nuevas no coinciden.');
        return;
      }
    }
    setMostrarConfirmacion(true);
  };


    const ejecutarGuardado = async () => {
    setMostrarConfirmacion(false);
    setGuardando(true);
    try {
      let fotoUrl = foto;

      if (fotoArchivo) {
        const formData = new FormData();
        formData.append('archivo', fotoArchivo);
        const fotoResp = await api.post('/perfil/foto', formData, { 
            headers: { 'Content-Type': 'multipart/form-data' } 
        });
        fotoUrl = fotoResp.data.foto + '?t=' + Date.now();
      }

      await api.put('/perfil', null, {
          params: {
            nombre: nombreEd,
            apellido_paterno: apellidoPEd,
            apellido_materno: apellidoMEd || '',
          },
      });

      if (passwordEd) {
        await api.post('/perfil/password', new URLSearchParams({ contrasena: passwordEd }), { 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' } 
        });
      }

      setNombre(nombreEd);
      setApellidoPaterno(apellidoPEd);
      setApellidoMaterno(apellidoMEd);
      setFoto(fotoUrl);

      localStorage.setItem(
        'usuario',
        JSON.stringify({
          ...usuarioGuardado,
          nombre: nombreEd,
          apellido_paterno: apellidoPEd,
          apellido_materno: apellidoMEd || '',
          email: email,
          foto: fotoUrl,
        })
      );

      setMensaje('¡Cambios guardados correctamente!');
      setMostrarConfigurar(false);
      setPasswordEd('');
      setConfirmPasswordEd('');
      setFotoArchivo(null);
      setMostrarAvanzado(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col overflow-y-auto transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-content-bg)' }}
    >
      {/* HEADER */}
      <header className="p-10 pb-6">
        <h2 className="text-4xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tight">
          Configuración
        </h2>
        <p className="text-center text-xl text-slate-600 dark:text-slate-400 mt-2 font-medium">
          Administra tu cuenta y preferencias del sistema
        </p>
        <div
          className="w-full h-0.5 mt-8 rounded-full opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
      </header>

      <main className="p-10 pt-0 max-w-4xl mx-auto flex flex-col gap-8 w-full">
        {mensaje && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
            <ShieldCheck size={20} /> {mensaje}
          </div>
        )}
        {error && !mostrarConfigurar && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl font-bold text-center">
            {error}
          </div>
        )}

        {/* DATOS DEL PERFIL (solo lectura) */}
        <section
          className="p-8 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 flex gap-6 items-start transition-colors"
          style={{ backgroundColor: 'var(--color-card-bg)' }}
        >
          <div
            className="p-4 rounded-full text-white shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <User size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
              Datos del perfil
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              Estos datos son de solo lectura. Usa &quot;Configurar&quot; para editarlos.
            </p>

            <div className="flex items-center gap-6 mb-8">
              <div
                className="w-28 h-28 rounded-full overflow-hidden border-4 shadow-md flex items-center justify-center"
                style={{
                  borderColor: 'var(--color-primary)',
                  backgroundColor: modoOscuro ? '#334155' : '#e2e8f0',
                }}
              >
                {foto ? (
                  <img src={foto} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-slate-700 dark:text-white">Foto de perfil</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre
                </label>
                <input type="text" value={nombre} disabled className={inputGray} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Apellido Paterno
                </label>
                <input type="text" value={apellidoPaterno} disabled className={inputGray} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Apellido Materno
                </label>
                <input type="text" value={apellidoMaterno} disabled className={inputGray} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <input type="email" value={email} disabled className={inputGray} />
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Lock size={12} /> El correo no se puede modificar por seguridad.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={abrirConfigurar}
                className="px-6 py-2.5 text-white font-semibold rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Configurar
              </button>
            </div>
          </div>
        </section>

        {/* PERSONALIZACIÓN */}
        <section
          className="p-8 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 flex gap-6 items-start transition-colors"
          style={{ backgroundColor: 'var(--color-card-bg)' }}
        >
          <div
            className="p-4 rounded-full text-white shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Palette size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              Personalización
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Elige el color y el modo de la interfaz.
            </p>

            <div
              className="flex items-center justify-between p-4 rounded-xl mb-8"
              style={{
                backgroundColor: modoOscuro ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-center gap-3">
                {modoOscuro ? (
                  <Moon style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <Sun style={{ color: 'var(--color-primary)' }} />
                )}
                <div>
                  <p className="font-bold text-slate-700 dark:text-white">Modo Oscuro</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {modoOscuro ? 'Activado' : 'Desactivado'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModoOscuro(!modoOscuro)}
                className="w-14 h-8 rounded-full transition-colors relative"
                style={{ backgroundColor: modoOscuro ? 'var(--color-primary)' : '#cbd5e1' }}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow ${
                    modoOscuro ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="font-bold text-slate-700 dark:text-white mb-4">
              Color principal
              {modoOscuro && (
                <span className="ml-2 text-xs font-normal text-slate-400 italic">
                  (Deshabilitado en Modo Oscuro)
                </span>
              )}
            </p>

            <div
              className={`flex gap-5 flex-wrap transition-all duration-300 ${
                modoOscuro ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              {Object.entries(TEMAS).map(([clave, tema]) => (
                <button
                  key={clave}
                  onClick={() => setColor(clave)}
                  disabled={modoOscuro}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`w-16 h-16 rounded-full ${tema.swatch} shadow-md group-hover:scale-110 transition-transform flex items-center justify-center`}
                    style={
                      color === clave
                        ? {
                            boxShadow: `0 0 0 3px ${
                              modoOscuro ? '#1e293b' : '#fff'
                            }, 0 0 0 6px ${tema.primary}`,
                          }
                        : {}
                    }
                  >
                    {color === clave && <Check className="text-white" size={28} />}
                  </div>
                  <span
                    className={`font-semibold text-sm ${
                      color === clave
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {tema.nombre}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════ MODAL CONFIGURAR ═══════════ */}
      {mostrarConfigurar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">
                Configurar Perfil
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Modifica tu información personal y preferencias.
              </p>
            </div>

            {/* FOTO EDITABLE */}
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-md flex items-center justify-center"
                  style={{
                    borderColor: 'var(--color-primary)',
                    backgroundColor: modoOscuro ? '#334155' : '#e2e8f0',
                  }}
                >
                  {fotoEd ? (
                    <img src={fotoEd} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-slate-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full text-white shadow-lg hover:scale-110 transition-transform"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  title="Cambiar foto"
                >
                  <Camera size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={seleccionarFoto}
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-bold text-slate-700 dark:text-white text-sm">Foto de perfil</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Haz clic en la cámara para cambiarla
                </p>
              </div>
            </div>

            {/* CAMPOS BÁSICOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombreEd}
                  onChange={(e) => setNombreEd(e.target.value)}
                  className={inputEdit}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
                  Apellido Paterno
                </label>
                <input
                  type="text"
                  value={apellidoPEd}
                  onChange={(e) => setApellidoPEd(e.target.value)}
                  className={inputEdit}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  value={apellidoMEd}
                  onChange={(e) => setApellidoMEd(e.target.value)}
                  className={inputEdit}
                />
              </div>

              {/* CORREO BLOQUEADO PARA TODOS */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
                  Correo Electrónico
                </label>
                <input type="email" value={email} disabled className={inputGray} />
                <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-semibold">
                  <Lock size={12} /> Por seguridad, el correo no se puede modificar.
                </p>
              </div>
            </div>

            {/* ERROR DENTRO DEL MODAL */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 px-3 py-2 rounded-lg text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {/* CONFIGURACIÓN AVANZADA: SOLO CONTRASEÑA */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setMostrarAvanzado((v) => !v)}
                className="inline-flex items-center gap-1 text-sm font-semibold hover:underline transition-colors"
                style={{ color: 'var(--color-primary)' }}
              >
                {mostrarAvanzado ? 'Ocultar cambio de contraseña' : 'Cambiar contraseña'}
                {mostrarAvanzado ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {!mostrarAvanzado && (
                <p className="text-xs text-slate-400 mt-1">
                  Actualiza tu contraseña de acceso
                </p>
              )}
            </div>

            {mostrarAvanzado && (
              <div className="flex flex-col gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  ⚠️ Asegúrate de recordar tu nueva contraseña
                </p>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordEd}
                    onChange={(e) => setPasswordEd(e.target.value)}
                    placeholder="••••••••"
                    className={inputEdit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPasswordEd}
                    onChange={(e) => setConfirmPasswordEd(e.target.value)}
                    placeholder="••••••••"
                    className={inputEdit}
                  />
                </div>
              </div>
            )}

            {/* BOTONES */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setMostrarConfigurar(false);
                  setError('');
                }}
                className="flex-1 py-2.5 font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white hover:opacity-80 transition-opacity"
              >
                Cancelar
              </button>
              <button
                onClick={pedirConfirmacion}
                disabled={guardando}
                className="flex-1 py-2.5 text-white font-bold rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-all"
              >
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL CONFIRMACIÓN ═══════════ */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center flex flex-col gap-5">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={32} className="text-amber-600 dark:text-amber-300" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                ¿Deseas realizar los cambios?
              </h3>

              {hayCambioSensible ? (
                <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold mb-3 leading-relaxed">
                  Estás modificando tu <strong>contraseña</strong>. Asegúrate de recordarla.
                </p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Se actualizarán tus datos de perfil.
                </p>
              )}

              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Al guardar, tu perfil se actualizará con los nuevos datos. Confirma que todo esté
                correcto.
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="flex-1 py-3 font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white hover:opacity-80 transition-opacity"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarGuardado}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Configuracion;