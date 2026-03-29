'use client';

import { useState, useRef, useCallback } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import Link from 'next/link';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // --- ESTADOS CALENDARIO ---
  const [calData, setCalData] = useState({ titulo: '', fecha: '', descripcion: '', stream_url: '' });
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [calStatus, setCalStatus] = useState('idle');

  // --- ESTADOS VOTACIONES ---
  const [votData, setVotData] = useState({ titulo: '', descripcion: '', op1: '', op2: '', op3: '', op4: '' });
  const [votStatus, setVotStatus] = useState('idle');

  // --- ESTADOS CROPPER ---
  const [srcImage, setSrcImage] = useState<string | null>(null);
  const [isCroppingModalOpen, setIsCroppingModalOpen] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ADMIN_PASSWORD = 'gofre'; 

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días";
    if (hour < 20) return "¡Buenas tardes";
    return "¡Buenas noches";
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsAuthenticated(true);
    else alert('Contraseña incorrecta');
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
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
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
        setCalData({ titulo: '', fecha: '', descripcion: '', stream_url: '' });
        setCroppedImageUrl(null);
        setTimeout(() => setCalStatus('idle'), 3000);
      } else setCalStatus('error');
    } catch (e) { setCalStatus('error'); }
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
        body: JSON.stringify({ titulo: votData.titulo, descripcion: votData.descripcion, opciones: opcionesValidas }),
      });
      if (res.ok) {
        setVotStatus('success');
        setVotData({ titulo: '', descripcion: '', op1: '', op2: '', op3: '', op4: '' });
        setTimeout(() => setVotStatus('idle'), 3000);
      } else setVotStatus('error');
    } catch (e) { setVotStatus('error'); }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0B0813] text-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col gap-6 shadow-2xl w-full max-w-sm">
          <h1 className="text-3xl font-black italic text-[#F5C242] text-center uppercase tracking-tighter leading-none">Acceso Privado</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña..." className="bg-black/50 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#F5C242]"/>
          <button type="submit" className="bg-[#F5C242] text-black font-black uppercase italic py-4 rounded-xl hover:scale-105 transition-transform tracking-widest text-sm shadow-lg">Entrar</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0813] text-white p-4 md:p-12 font-sans overflow-x-hidden relative">
      <div className="max-w-[1200px] mx-auto relative z-10">
        
        {/* CABECERA CON BOTÓN VOLVER A LA WEB */}
        <header className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-[#F5C242] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase italic tracking-wider">Admin Mode</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
              {getGreeting()}, <span className="text-[#F5C242]">Sr. Gxfre</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-3 opacity-60">
              Bienvenido a tu panel de control personal. ¿Qué vamos a preparar hoy?
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-[10px] font-black uppercase italic hover:bg-white/10 transition-all tracking-widest flex items-center gap-2">
              <span>🌐</span> Ver Web
            </Link>
            <button onClick={() => setIsAuthenticated(false)} className="px-6 py-3 rounded-xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase italic hover:bg-red-500/10 transition-all tracking-widest">
              Cerrar Sesión
            </button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* SECCIÓN CALENDARIO */}
          <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden flex flex-col gap-6 backdrop-blur-md">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F5C242] to-transparent opacity-50"></div>
            <h2 className="text-2xl font-black italic text-[#F5C242] uppercase tracking-tighter leading-none">Añadir al Calendario</h2>
            <div className="flex flex-col gap-3">
              {croppedImageUrl ? (
                <div className="relative group overflow-hidden rounded-2xl border-2 border-[#F5C242]/30">
                  <img src={croppedImageUrl} alt="Preview" className="w-full h-auto"/>
                  <button onClick={() => setCroppedImageUrl(null)} className="absolute top-4 right-4 bg-red-600/90 text-white p-3 rounded-full hover:bg-red-700 transition-colors shadow-lg">✕</button>
                </div>
              ) : (
                <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFileChange(e.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()} className="w-full h-64 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#F5C242]/50 hover:bg-[#F5C242]/5 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer p-8 text-center bg-black/20">
                  <span className="text-5xl drop-shadow-md">🖼️</span>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Suelta tu foto o haz clic</p>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files)} className="hidden"/>
                </div>
              )}
            </div>
            <form onSubmit={handleCalendarioSubmit} className="flex flex-col gap-4">
              <input required type="text" placeholder="Título del directo" value={calData.titulo} onChange={e => setCalData({...calData, titulo: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#F5C242] text-white"/>
              <input required type="date" value={calData.fecha} onChange={e => setCalData({...calData, fecha: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#F5C242] text-gray-300"/>
              <textarea placeholder="Descripción breve..." value={calData.descripcion} onChange={e => setCalData({...calData, descripcion: e.target.value})} rows={3} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#F5C242] text-white resize-none"/>
              <input type="text" placeholder="URL del Stream" value={calData.stream_url} onChange={e => setCalData({...calData, stream_url: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#F5C242] text-white"/>
              <button disabled={calStatus === 'loading'} type="submit" className="mt-2 bg-[#F5C242]/10 border border-[#F5C242]/20 text-[#F5C242] font-black uppercase italic py-4 rounded-xl hover:bg-[#F5C242] hover:text-black transition-all tracking-widest text-xs">
                {calStatus === 'loading' ? 'Subiendo...' : 'Publicar Evento'}
              </button>
              {calStatus === 'success' && <p className="text-green-400 text-[10px] text-center font-black uppercase italic tracking-widest animate-pulse mt-2">✓ ¡Publicado con éxito!</p>}
              {calStatus === 'error' && <p className="text-red-400 text-[10px] text-center font-black uppercase italic tracking-widest mt-2">❌ Error al subir</p>}
            </form>
          </section>

          {/* SECCIÓN VOTACIONES */}
          <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden backdrop-blur-md flex flex-col gap-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7A56B1] to-transparent opacity-50"></div>
            <h2 className="text-2xl font-black italic text-[#7A56B1] uppercase tracking-tighter leading-none">Nueva Encuesta</h2>
            <form onSubmit={handleVotacionSubmit} className="flex flex-col gap-4">
              <input required type="text" placeholder="Pregunta Principal" value={votData.titulo} onChange={e => setVotData({...votData, titulo: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#7A56B1] text-white"/>
              <textarea placeholder="Instrucciones" value={votData.descripcion} onChange={e => setVotData({...votData, descripcion: e.target.value})} rows={2} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#7A56B1] text-white resize-none"/>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <input required type="text" placeholder="Opción 1" value={votData.op1} onChange={e => setVotData({...votData, op1: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#7A56B1] text-white"/>
                <input required type="text" placeholder="Opción 2" value={votData.op2} onChange={e => setVotData({...votData, op2: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#7A56B1] text-white"/>
                <input type="text" placeholder="Opción 3" value={votData.op3} onChange={e => setVotData({...votData, op3: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#7A56B1] text-white"/>
                <input type="text" placeholder="Opción 4" value={votData.op4} onChange={e => setVotData({...votData, op4: e.target.value})} className="bg-black/40 border border-white/5 p-4 rounded-xl text-sm outline-none focus:border-[#7A56B1] text-white"/>
              </div>
              <button disabled={votStatus === 'loading'} type="submit" className="mt-4 bg-[#7A56B1]/10 border border-[#7A56B1]/20 text-[#7A56B1] font-black uppercase italic py-4 rounded-xl hover:bg-[#7A56B1] hover:text-white transition-all tracking-widest text-xs shadow-lg">
                {votStatus === 'loading' ? 'Actualizando...' : 'Publicar Votación'}
              </button>
              {votStatus === 'success' && <p className="text-green-400 text-[10px] text-center font-black uppercase italic tracking-widest animate-pulse mt-2">✓ Encuesta publicada</p>}
              {votStatus === 'error' && <p className="text-red-400 text-[10px] text-center font-black uppercase italic tracking-widest mt-2">❌ Error al publicar</p>}
            </form>
          </section>
        </div>
      </div>

      {/* MODAL RECORTADOR */}
      {isCroppingModalOpen && srcImage && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-[#0B0813] border border-white/10 rounded-[3rem] w-full max-w-5xl h-[90vh] p-8 flex flex-col gap-6 shadow-[0_0_100px_rgba(0,0,0,1)]">
            <header className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-2xl font-black italic text-[#F5C242] uppercase tracking-tighter leading-none">RECORTAR IMAGEN</h3>
            </header>
            <div className="flex-grow w-full rounded-3xl overflow-hidden border border-white/10 bg-black/50 min-h-0">
              <Cropper src={srcImage} style={{ height: "100%", width: "100%" }} initialAspectRatio={16/9} aspectRatio={16/9} guides={true} ref={cropperRef} viewMode={1} dragMode="move" background={false} responsive={true} autoCropArea={1} />
            </div>
            <footer className="flex justify-end gap-4 mt-2">
              <button onClick={() => { setIsCroppingModalOpen(false); setSrcImage(null); }} className="px-8 py-5 rounded-2xl text-[10px] font-black uppercase italic border border-white/5 bg-white/5 text-gray-400 hover:text-white transition-all">Cancelar</button>
              <button onClick={handleCrop} className="px-12 py-5 rounded-2xl text-[10px] font-black uppercase italic border border-[#F5C242]/30 bg-[#F5C242]/10 text-[#F5C242] hover:bg-[#F5C242] hover:text-black transition-all tracking-[0.2em]">GUARDAR RECORTE ✓</button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}