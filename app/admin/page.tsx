'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import Link from 'next/link';

// 🚀 TIPOGRAFÍA SPACE GROTESK
import { Space_Grotesk } from 'next/font/google';
const mainFont = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- ESTADOS CALENDARIO ---
  const [calData, setCalData] = useState({ 
    titulo: '', 
    fecha: '', 
    hora_fin: '', 
    descripcion: '', 
    stream_url: '' 
  });
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [calStatus, setCalStatus] = useState('idle');
  const [dbEvents, setDbEvents] = useState<any[]>([]); 

  // --- ESTADOS VOTACIONES ---
  const [votData, setVotData] = useState({ 
    titulo: '', 
    descripcion: '', 
    op1: '', op2: '', op3: '', op4: '',
    fecha_cierre: '' 
  });
  const [votStatus, setVotStatus] = useState('idle');

  // --- ESTADOS CROPPER ---
  const [srcImage, setSrcImage] = useState<string | null>(null);
  const [isCroppingModalOpen, setIsCroppingModalOpen] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEventos = async () => {
    try {
      const res = await fetch('/api/calendario');
      if (res.ok) {
        const data = await res.json();
        setDbEvents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error cargando directos", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchEventos();
  }, [isAuthenticated]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días";
    if (hour < 20) return "¡Buenas tardes";
    return "¡Buenas noches";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }), 
      });
      if (res.ok) setIsAuthenticated(true);
      else { alert('Contraseña incorrecta'); setPassword(''); }
    } catch (error) { alert('Error de conexión'); }
    finally { setIsLoggingIn(false); }
  };

  const onFileChange = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setSrcImage(reader.result as string);
        setIsCroppingModalOpen(true);
      };
      reader.readAsDataURL(files[0]);
    }
  }, []);

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const canvas = cropper.getCroppedCanvas({ width: 1024 });
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      setCroppedImageUrl(compressedBase64);
      setIsCroppingModalOpen(false);
      setSrcImage(null);
    }
  };

  const handleCalendarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!croppedImageUrl) { alert('Sube una imagen primero'); return; }
    setCalStatus('loading');
    try {
      const res = await fetch('/api/admin/calendario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...calData, imagen_base64: croppedImageUrl }),
      });
      if (res.ok) {
        setCalStatus('success');
        setCalData({ titulo: '', fecha: '', hora_fin: '', descripcion: '', stream_url: '' });
        setCroppedImageUrl(null);
        fetchEventos();
        setTimeout(() => setCalStatus('idle'), 3000);
      } else setCalStatus('error');
    } catch (e) { setCalStatus('error'); }
  };

  const borrarEvento = async (id: string | number) => {
    const confirmar = window.confirm("¿Seguro que quieres borrar este directo?");
    if (!confirmar) return;
    try {
      const res = await fetch('/api/admin/calendario', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) setDbEvents(prev => prev.filter(ev => ev.id !== id));
    } catch (error) { alert("Error al borrar."); }
  };

  const handleVotacionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const opcionesValidas = [votData.op1, votData.op2, votData.op3, votData.op4].filter(op => op.trim() !== "");
    if (opcionesValidas.length < 2) { alert("Introduce al menos 2 opciones"); return; }
    setVotStatus('loading');
    try {
      const res = await fetch('/api/admin/votaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          titulo: votData.titulo, 
          descripcion: votData.descripcion, 
          opciones: opcionesValidas,
          fecha_cierre: votData.fecha_cierre 
        }),
      });
      if (res.ok) {
        setVotStatus('success');
        setVotData({ titulo: '', descripcion: '', op1: '', op2: '', op3: '', op4: '', fecha_cierre: '' });
        setTimeout(() => setVotStatus('idle'), 3000);
      } else setVotStatus('error');
    } catch (e) { setVotStatus('error'); }
  };

  if (!isAuthenticated) {
    return (
      <main className={`min-h-screen bg-[#0B0813] text-white flex items-center justify-center p-4 ${mainFont.className}`}>
        <form onSubmit={handleLogin} className="bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col gap-6 shadow-2xl w-full max-w-sm">
          <h1 className="text-3xl font-bold text-[#F5C242] text-center uppercase tracking-tighter leading-none">Acceso Privado</h1>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Usuario</label>
            <input type="text" value="Gxfre" readOnly className="bg-white/5 border border-white/5 p-4 rounded-xl text-gray-400 outline-none cursor-default font-bold" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Clave secreta..." className="bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#F5C242]" required />
          </div>
          <button type="submit" disabled={isLoggingIn} className="bg-[#F5C242] text-black font-bold uppercase py-4 rounded-xl hover:scale-105 transition-all mt-4 disabled:opacity-50">
            {isLoggingIn ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-[#0B0813] text-white p-4 md:p-12 relative overflow-x-hidden ${mainFont.className}`}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css" />

      <div className="max-w-[1200px] mx-auto relative z-10 flex flex-col gap-10">
        <header className="border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="bg-[#F5C242] text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-3 inline-block">Admin Mode</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tighter leading-none">
              {getGreeting()}, <span className="text-[#F5C242]">Gxfre</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-[10px] font-bold uppercase hover:bg-white/10 transition-all flex items-center gap-2">🌐 Ver Web</Link>
            <button onClick={() => setIsAuthenticated(false)} className="px-6 py-3 rounded-xl border border-red-500/20 text-red-500 text-[10px] font-bold uppercase hover:bg-red-500/10 transition-all">Cerrar Sesión</button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* SECCIÓN CALENDARIO */}
          <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden flex flex-col gap-6 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-[#F5C242] uppercase tracking-tighter leading-none">Añadir al Calendario</h2>
            <div className="flex flex-col gap-3">
              {croppedImageUrl ? (
                <div className="relative group overflow-hidden rounded-2xl border-2 border-[#F5C242]/30">
                  <img src={croppedImageUrl} alt="Preview" className="w-full h-auto"/>
                  <button onClick={() => setCroppedImageUrl(null)} className="absolute top-4 right-4 bg-red-600/90 text-white p-3 rounded-full hover:bg-red-700 transition-colors shadow-lg">✕</button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-64 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#F5C242]/50 flex flex-col items-center justify-center gap-4 cursor-pointer p-8 text-center bg-black/20 transition-all">
                  <span className="text-5xl">🖼️</span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Sube la foto del directo</p>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files)} className="hidden"/>
                </div>
              )}
            </div>
            <form onSubmit={handleCalendarioSubmit} className="flex flex-col gap-4">
              <input required type="text" placeholder="Título del directo" value={calData.titulo} onChange={e => setCalData({...calData, titulo: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#F5C242] text-white"/>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Día del directo</label>
                  <input required type="date" value={calData.fecha} onChange={e => setCalData({...calData, fecha: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#F5C242] text-gray-300 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70"/>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#F5C242] uppercase tracking-widest ml-1">Hora de Cierre/Fin</label>
                  <input required type="time" value={calData.hora_fin} onChange={e => setCalData({...calData, hora_fin: e.target.value})} className="bg-black/40 border border-[#F5C242]/30 p-4 rounded-xl text-sm outline-none focus:border-[#F5C242] text-gray-300 [&::-webkit-calendar-picker-indicator]:invert"/>
                </div>
              </div>

              <textarea placeholder="Descripción breve..." value={calData.descripcion} onChange={e => setCalData({...calData, descripcion: e.target.value})} rows={3} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#F5C242] text-white resize-none"/>
              <input type="text" placeholder="URL del Stream" value={calData.stream_url} onChange={e => setCalData({...calData, stream_url: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#F5C242] text-white"/>
              
              <button disabled={calStatus === 'loading'} type="submit" className="mt-2 bg-[#F5C242]/10 border border-[#F5C242]/20 text-[#F5C242] font-bold uppercase py-4 rounded-xl hover:bg-[#F5C242] hover:text-black transition-all text-xs tracking-widest">
                {calStatus === 'loading' ? 'Subiendo...' : 'Publicar Evento'}
              </button>
            </form>
          </section>

          {/* SECCIÓN VOTACIONES */}
          <div className="flex flex-col gap-10">
            <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-[#7A56B1] uppercase tracking-tighter">Nueva Encuesta</h2>
              <form onSubmit={handleVotacionSubmit} className="flex flex-col gap-4">
                <input required type="text" placeholder="Pregunta" value={votData.titulo} onChange={e => setVotData({...votData, titulo: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#7A56B1] text-white"/>
                
                <div className="grid grid-cols-2 gap-3">
                  <input required type="text" placeholder="Opción 1" value={votData.op1} onChange={e => setVotData({...votData, op1: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm text-white outline-none focus:border-[#7A56B1]"/>
                  <input required type="text" placeholder="Opción 2" value={votData.op2} onChange={e => setVotData({...votData, op2: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm text-white outline-none focus:border-[#7A56B1]"/>
                  <input type="text" placeholder="Opción 3" value={votData.op3} onChange={e => setVotData({...votData, op3: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm text-white outline-none focus:border-[#7A56B1]"/>
                  <input type="text" placeholder="Opción 4" value={votData.op4} onChange={e => setVotData({...votData, op4: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm text-white outline-none focus:border-[#7A56B1]"/>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-[10px] font-bold text-[#7A56B1] uppercase tracking-widest ml-1">Fecha y Hora de Cierre</label>
                  <input required type="datetime-local" value={votData.fecha_cierre} onChange={e => setVotData({...votData, fecha_cierre: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm text-white outline-none focus:border-[#7A56B1] [&::-webkit-calendar-picker-indicator]:invert"/>
                </div>

                <button disabled={votStatus === 'loading'} type="submit" className="mt-4 bg-[#7A56B1]/10 border border-[#7A56B1]/20 text-[#7A56B1] font-bold uppercase py-4 rounded-xl hover:bg-[#7A56B1] hover:text-white transition-all text-xs tracking-widest shadow-lg">
                  {votStatus === 'loading' ? 'Publicando...' : 'Publicar Votación'}
                </button>
              </form>
            </section>

            <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Gestionar Directos</h2>
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {dbEvents.map(evento => (
                  <div key={evento.id} className="flex justify-between items-center bg-black/40 border border-white/5 p-3 rounded-2xl">
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-bold text-[#F5C242] text-xs uppercase truncate">{evento.titulo}</h3>
                      <p className="text-[9px] text-gray-500 uppercase">{new Date(evento.fecha).toLocaleDateString()} - Fin: {evento.hora_fin || '??:??'}</p>
                    </div>
                    <button onClick={() => borrarEvento(evento.id)} className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg font-bold text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all">Borrar</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* MODAL RECORTADOR */}
      {isCroppingModalOpen && srcImage && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-[#0B0813] border border-white/10 rounded-[3rem] w-full max-w-5xl h-[90vh] p-8 flex flex-col gap-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-[#F5C242] uppercase tracking-tighter leading-none">RECORTAR IMAGEN</h3>
            <div className="flex-grow w-full rounded-3xl overflow-hidden border border-white/10 bg-black/50 min-h-0">
              <Cropper src={srcImage} style={{ height: "100%", width: "100%" }} guides={true} ref={cropperRef} viewMode={1} background={false} responsive={true} autoCropArea={1} />
            </div>
            <footer className="flex justify-end gap-4 mt-2">
              <button onClick={() => { setIsCroppingModalOpen(false); setSrcImage(null); }} className="px-8 py-5 rounded-2xl text-[10px] font-bold uppercase border border-white/5 bg-white/5 text-gray-400">Cancelar</button>
              <button onClick={handleCrop} className="px-12 py-5 rounded-2xl text-[10px] font-bold uppercase border border-[#F5C242]/30 bg-[#F5C242]/10 text-[#F5C242] hover:bg-[#F5C242] hover:text-black transition-all">Guardar Recorte ✓</button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}