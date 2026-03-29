'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react'; // 👈 Importamos la sesión

const SUGGESTION_TYPES = [
  { id: 'NOTICIA', label: 'NOTICIA', icon: '📰' },
  { id: 'REACCION', label: 'REACCION A VIDEO', img: '/v.png' },
  { id: 'JUEGO', label: 'JUEGO', icon: '🕹️' },
  { id: 'CHARLA', label: 'IDEA PARA CHARLA', icon: '💬' },
  { id: 'EVENTO', label: 'IDEA DE EVENTO', icon: '💡' },
  { id: 'OTROS', label: 'OTROS', img: '/gofre.png' }, 
];

export default function Sugerencias() {
  const { data: session, status: authStatus } = useSession(); // 🛡️ Hook de sesión
  const [formData, setFormData] = useState({ 
    tipo: 'JUEGO', 
    idea: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.idea.trim() || !formData.tipo || status === 'loading') return;

    setStatus('loading');

    try {
      const res = await fetch('/api/sugerencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // La API sacará el nombre/email de la sesión
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ tipo: 'JUEGO', idea: '' });
        setTimeout(() => setStatus('idle'), 5000); 
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const currentTypeLabel = useMemo(() => {
    return SUGGESTION_TYPES.find(t => t.id === formData.tipo)?.label || 'CATEGORÍA';
  }, [formData.tipo]);

  // Pantalla de carga mientras NextAuth verifica quién eres
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0B0813] flex items-center justify-center">
        <div className="text-[#F5C242] font-black animate-pulse uppercase tracking-[0.5em]">Verificando acceso...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0813] text-white p-4 md:p-12 font-sans relative overflow-x-hidden">
      <div className="fixed top-[10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-10 blur-[150px] bg-[#F5C242] pointer-events-none z-0" />

      <div className="max-w-[1000px] mx-auto relative z-10 flex flex-col gap-8">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-[#F5C242] tracking-tighter uppercase italic leading-none drop-shadow-lg">
              SUGERENCIAS
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.4em] mt-3">
              Ayúdame a mejorar el stream
            </p>
          </div>
          <Link href="/" className="px-6 py-4 rounded-xl text-xs font-black uppercase italic border border-white/10 bg-white/5 hover:bg-white/10 hover:text-[#F5C242] transition-all flex items-center gap-2">
            ‹ Volver
          </Link>
        </header>

        {/* 🛡️ LÓGICA DE ACCESO: Si no está logueado, mostramos el bloqueo */}
        {!session ? (
          <section className="bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] p-12 border border-white/10 text-center flex flex-col items-center gap-6 shadow-2xl">
            <div className="text-6xl">🔒</div>
            <h2 className="text-2xl font-black uppercase italic text-[#F5C242]">Acceso Restringido</h2>
            <p className="text-gray-400 max-w-md font-bold italic">
              Para evitar el spam y mantener la calidad de las ideas, necesitas estar registrado para enviar sugerencias.
            </p>
            <Link 
              href="/login" 
              className="px-12 py-5 rounded-2xl bg-[#F5C242] text-black font-black uppercase italic hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,194,66,0.3)]"
            >
              Iniciar Sesión
            </Link>
          </section>
        ) : (
          /* ✅ FORMULARIO PARA USUARIOS LOGUEADOS */
          <section className="bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-2xl shadow-black/50 relative overflow-hidden w-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F5C242] to-transparent opacity-50"></div>
            
            <form className="flex flex-col gap-8 relative z-10" onSubmit={handleSubmit}>
              
              {/* Info del usuario (Auto-completado) */}
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#7A56B1] flex items-center justify-center font-black text-white italic">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#F5C242] uppercase tracking-[0.2em]">Enviando como:</p>
                  <p className="text-sm font-black italic text-white">{session.user?.name} <span className="text-gray-500 font-medium ml-2 text-xs">({session.user?.email})</span></p>
                </div>
              </div>

              {/* TIPO DE SUGERENCIA */}
              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black text-[#F5C242] uppercase tracking-[0.3em] italic ml-2">
                  TIPO DE SUGERENCIA ({currentTypeLabel})
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {SUGGESTION_TYPES.map((type) => {
                    const isSelected = formData.tipo === type.id;
                    return (
                      <motion.div
                        key={type.id}
                        onClick={() => setFormData({ ...formData, tipo: type.id })}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`group relative flex flex-col items-center justify-center gap-3 p-5 text-center cursor-pointer rounded-2xl border transition-all duration-300 h-[120px]
                          ${isSelected ? 'bg-[#7A56B1]/20 border-[#7A56B1]/70 shadow-2xl shadow-[#7A56B1]/20' : 'bg-black/40 border-white/5 hover:border-[#F5C242]/50 hover:bg-white/5'}`}
                      >
                        <div className={`absolute top-3 right-3 w-3 h-3 rounded-full border border-white/30 transition-all
                          ${isSelected ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]' : ''}`} />
                        
                        <div className="h-10 flex items-center justify-center">
                          {type.img ? (
                            <Image src={type.img} alt={type.label} width={40} height={40} className="object-contain" />
                          ) : (
                            <span className="text-4xl leading-none">{type.icon}</span>
                          )}
                        </div>

                        <span className={`text-[9px] font-black uppercase italic tracking-widest leading-tight
                          ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                          {type.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Campo Descripcion */}
              <div className="flex flex-col gap-3">
                <label htmlFor="idea" className="text-[10px] font-black text-[#F5C242] uppercase tracking-[0.3em] italic ml-2">
                  Descripción de la idea *
                </label>
                <textarea 
                  id="idea"
                  required
                  rows={6}
                  value={formData.idea}
                  onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                  placeholder="Escribe aquí de qué trata tu sugerencia... ¡Con todo lujo de detalles!"
                  className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#F5C242] focus:ring-1 focus:ring-[#F5C242] focus:bg-white/5 transition-all resize-none outline-none leading-relaxed"
                />
              </div>
              
              {/* Botón y Feedback */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-4">
                <div className="text-sm font-bold italic">
                  <AnimatePresence>
                    {status === 'success' && (
                      <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-green-400">
                        ¡Sugerencia enviada con éxito! Gracias 💛
                      </motion.span>
                    )}
                    {status === 'error' && (
                      <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400">
                        Hubo un error al enviar. Inténtalo de nuevo.
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  type="submit"
                  disabled={status === 'loading' || !formData.idea.trim() || !formData.tipo}
                  className={`px-12 py-5 rounded-2xl font-black uppercase italic text-sm tracking-[0.2em] transition-all flex items-center gap-3
                    ${status === 'loading' ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/5' : 
                    !formData.idea.trim() || !formData.tipo ? 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed' : 
                    'bg-[#F5C242]/10 border border-[#F5C242]/40 text-[#F5C242] hover:bg-[#F5C242] hover:text-black hover:scale-105 shadow-[0_0_20px_rgba(245,194,66,0.2)]'}`}
                >
                  {status === 'loading' ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </section>
        )}

      </div>
    </main>
  );
}