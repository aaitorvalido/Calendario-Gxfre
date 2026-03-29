'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ usuario: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ GESTIÓN DE MÚSICA SINCRONIZADA
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio('/music-bg.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.25;

    // Recuperar posición y mute del localStorage
    const savedTime = localStorage.getItem('music-pos');
    if (savedTime) audioRef.current.currentTime = parseFloat(savedTime);
    
    const savedMute = localStorage.getItem('music-muted');
    if (savedMute === 'true') {
      audioRef.current.muted = true;
      setIsMuted(true);
    }

    const interval = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        localStorage.setItem('music-pos', audioRef.current.currentTime.toString());
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        localStorage.setItem('music-pos', audioRef.current.currentTime.toString());
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startMusic = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newState = !audioRef.current.muted;
      audioRef.current.muted = newState;
      setIsMuted(newState);
      localStorage.setItem('music-muted', newState.toString());
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al registrar');
        setLoading(false);
      } else {
        setSuccess('¡Cuenta creada! Redirigiendo...');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0813] relative flex items-center justify-center p-6 text-white font-sans select-none overflow-hidden" onClick={startMusic}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-8 left-8 z-50">
        <Link href="/" className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase italic tracking-[0.2em] text-gray-400 hover:text-[#F5C242] transition-all group">
          <span className="text-lg leading-none transition-transform group-hover:-translate-x-1">‹</span> Volver al Inicio
        </Link>
      </motion.div>

      <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="absolute bottom-8 right-8 z-50 p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:scale-110 transition-all shadow-lg active:scale-90">
        {isMuted ? '🔇' : '🔊'}
      </button>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110vw] h-[110vh] z-0 pointer-events-auto">
        <Spline scene="https://prod.spline.design/w8gW4wl5FGDTT-c1/scene.splinecode" className="w-full h-full" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6 }} className="relative z-10 bg-black/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md shadow-2xl pointer-events-auto">
        <h2 className="text-4xl font-black italic text-[#F5C242] uppercase mb-8 text-center tracking-tighter">Únete</h2>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input type="text" placeholder="Usuario" className="w-full bg-black/60 border border-white/20 rounded-2xl p-4 text-sm font-bold focus:border-[#F5C242] text-white outline-none" onChange={(e) => setForm({...form, usuario: e.target.value})} required />
          <input type="email" placeholder="Email" className="w-full bg-black/60 border border-white/20 rounded-2xl p-4 text-sm font-bold focus:border-[#F5C242] text-white outline-none" onChange={(e) => setForm({...form, email: e.target.value})} required />
          <input type="password" placeholder="Contraseña" className="w-full bg-black/60 border border-white/20 rounded-2xl p-4 text-sm font-bold focus:border-[#F5C242] text-white outline-none" onChange={(e) => setForm({...form, password: e.target.value})} required />
          {error && <p className="text-red-500 text-xs font-black uppercase text-center mt-2 animate-pulse">{error}</p>}
          {success && <p className="text-green-400 text-xs font-black uppercase text-center mt-2 animate-pulse">{success}</p>}
          <button disabled={loading || success !== ''} className="w-full bg-[#F5C242] text-black font-black p-4 rounded-2xl uppercase italic hover:scale-105 transition-all mt-4">{loading ? 'Creando...' : success ? '¡Listo!' : 'Registrarse'}</button>
        </form>
        <div className="mt-8 text-center text-xs font-bold text-gray-400 flex flex-col items-center gap-2">
          <Link href="/login" className="text-white hover:text-[#F5C242] transition-colors underline underline-offset-4 pointer-events-auto">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </motion.div>
    </main>
  );
}