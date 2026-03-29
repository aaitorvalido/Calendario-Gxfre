'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Spline from '@splinetool/react-spline';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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

    // Guardar posición constantemente
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      usuario: form.usuario,
      password: form.password,
    });

    if (res?.error) {
      setError("Usuario o contraseña incorrectos");
      setLoading(false);
    } else {
      router.push('/'); 
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0813] relative text-white font-sans select-none overflow-hidden" onClick={startMusic}>
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

      <AnimatePresence mode="wait">
        {!showLogin ? (
          <motion.div key="letras-gxfre" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }} className="absolute top-[10%] left-0 right-0 z-10 cursor-pointer group flex flex-col items-center" onClick={() => { setShowLogin(true); startMusic(); }}>
            <h1 className="text-[12vw] md:text-9xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/30 tracking-tighter opacity-70 group-hover:opacity-100 transition-all duration-700 group-hover:drop-shadow-[0_0_50px_rgba(245,194,66,0.8)] group-hover:scale-105 uppercase pr-6 md:pr-10">GXFRE</h1>
            <p className="text-center text-[#F5C242] text-xs font-bold tracking-[0.5em] uppercase mt-2 animate-pulse">Click para entrar</p>
          </motion.div>
        ) : (
          <motion.div key="formulario-login" initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: "-50%", x: "-50%", scale: 1 }} transition={{ duration: 0.6 }} className="absolute top-1/2 left-1/2 z-20 bg-black/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 w-[90%] max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-auto">
            <h2 className="text-4xl font-black italic text-[#F5C242] uppercase mb-8 text-center tracking-tighter">Entrar</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input type="text" placeholder="Usuario" className="w-full bg-black/60 border border-white/20 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#F5C242] text-white" onChange={(e) => setForm({...form, usuario: e.target.value})} required />
              <input type="password" placeholder="Contraseña" className="w-full bg-black/60 border border-white/20 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#F5C242] text-white" onChange={(e) => setForm({...form, password: e.target.value})} required />
              {error && <p className="text-red-500 text-xs font-black uppercase text-center mt-2 animate-pulse">{error}</p>}
              <button disabled={loading} className="w-full bg-[#F5C242] text-black font-black p-4 rounded-2xl uppercase italic hover:scale-105 transition-all mt-4">{loading ? 'Cargando...' : 'Iniciar Sesión'}</button>
            </form>
            <div className="mt-8 text-center text-xs font-bold text-gray-400 flex flex-col items-center gap-3">
              <Link href="/registro" className="text-white hover:text-[#F5C242] transition-colors underline underline-offset-4">¿No tienes cuenta? Regístrate</Link>
              <button type="button" onClick={() => setShowLogin(false)} className="text-gray-500 hover:text-white transition-colors uppercase text-[10px] mt-2">← Volver al menú</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}