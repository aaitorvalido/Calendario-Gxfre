'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react'; // Importamos signIn
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ usuario: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
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
    <main className="min-h-screen bg-[#0B0813] relative flex items-center justify-center p-6 text-white font-sans select-none overflow-hidden">
      
      {/* BOTÓN VOLVER */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-8 left-8 z-50">
        <Link href="/" className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase italic tracking-[0.2em] text-gray-400 hover:text-[#F5C242] transition-all group">
          <span className="text-lg leading-none transition-transform group-hover:-translate-x-1">‹</span> Volver al Inicio
        </Link>
      </motion.div>

      {/* FONDO DE NEBULOSA */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#F5C242]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7A56B1]/5 blur-[120px] rounded-full"></div>
      </div>

      {/* TARJETA DE REGISTRO */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.6 }} 
        className="relative z-10 bg-black/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md shadow-2xl"
      >
        <h2 className="text-4xl font-black italic text-[#F5C242] uppercase mb-8 text-center tracking-tighter">Únete</h2>
        
        {/* REGISTRO RÁPIDO CON TWITCH */}
        <button 
          type="button"
          onClick={() => signIn('twitch', { callbackUrl: '/' })}
          className="w-full bg-[#9146FF] hover:bg-[#772ce8] text-white font-black p-4 rounded-2xl uppercase italic transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#9146FF]/20 group mb-6"
        >
          <svg className="group-hover:rotate-12 transition-transform" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0h1.714v5.143h-1.714zM5.143 0L1.714 3.429v15.428h5.143V24l3.428-3.429h4.286L22.286 12V0zm15.428 11.143l-3.428 3.428h-4.286l-2.572 2.572v-2.572H6.857V1.714h13.714z"/>
          </svg>
          Registro con Twitch
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-gray-600 text-[10px] font-bold uppercase tracking-widest text-center">O registro manual</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Usuario" 
            className="w-full bg-black/60 border border-white/20 rounded-2xl p-4 text-sm font-bold focus:border-[#F5C242] text-white outline-none transition-all" 
            onChange={(e) => setForm({...form, usuario: e.target.value})} 
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full bg-black/60 border border-white/20 rounded-2xl p-4 text-sm font-bold focus:border-[#F5C242] text-white outline-none transition-all" 
            onChange={(e) => setForm({...form, email: e.target.value})} 
            required 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full bg-black/60 border border-white/20 rounded-2xl p-4 text-sm font-bold focus:border-[#F5C242] text-white outline-none transition-all" 
            onChange={(e) => setForm({...form, password: e.target.value})} 
            required 
          />

          {error && <p className="text-red-500 text-xs font-black uppercase text-center mt-2 animate-pulse">{error}</p>}
          {success && <p className="text-green-400 text-xs font-black uppercase text-center mt-2 animate-pulse">{success}</p>}

          <button 
            disabled={loading || success !== ''} 
            className="w-full bg-[#F5C242] text-black font-black p-4 rounded-2xl uppercase italic hover:scale-105 active:scale-95 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Creando...' : success ? '¡Listo!' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs font-bold text-gray-400 flex flex-col items-center gap-2">
          <Link href="/login" className="text-white hover:text-[#F5C242] transition-colors underline underline-offset-4">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </motion.div>
    </main>
  );
}