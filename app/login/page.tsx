'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
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
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#9146FF]/10 blur-[120px] rounded-full"></div>
      </div>

      {/* TARJETA DE LOGIN UNICAMENTE TWITCH */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.6 }} 
        className="relative z-10 bg-black/50 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 w-full max-w-sm shadow-2xl text-center"
      >
        <div className="mb-10">
          <div className="w-20 h-20 bg-[#9146FF]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#9146FF]/30">
            <svg width="40" height="40" fill="#9146FF" viewBox="0 0 24 24">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0h1.714v5.143h-1.714zM5.143 0L1.714 3.429v15.428h5.143V24l3.428-3.429h4.286L22.286 12V0zm15.428 11.143l-3.428 3.428h-4.286l-2.572 2.572v-2.572H6.857V1.714h13.714z"/>
            </svg>
          </div>
          <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter mb-2">ENTRAR</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Accede con tu cuenta oficial</p>
        </div>
        
        <div className="flex flex-col gap-6">
          <button 
            type="button"
            onClick={() => signIn('twitch', { callbackUrl: '/' })}
            className="w-full bg-[#9146FF] hover:bg-[#772ce8] text-white font-black py-5 rounded-2xl uppercase italic transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#9146FF]/40 group hover:scale-[1.05] active:scale-95"
          >
            <svg className="group-hover:rotate-12 transition-transform" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0h1.714v5.143h-1.714zM5.143 0L1.714 3.429v15.428h5.143V24l3.428-3.429h4.286L22.286 12V0zm15.428 11.143l-3.428 3.428h-4.286l-2.572 2.572v-2.572H6.857V1.714h13.714z"/>
            </svg>
            Entrar con Twitch
          </button>

          <p className="text-gray-400 text-[11px] font-medium leading-relaxed px-4">
            Al entrar se verificará tu cuenta de Twitch para permitirte votar y participar.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5">
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
            Calendario-Gxfre &copy; 2026
          </p>
        </div>
      </motion.div>
    </main>
  );
}