'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react'; 

//  NUEVA ESTÉTICA: Space Grotesk 
import { Space_Grotesk } from 'next/font/google';
const mainFont = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

const SUGGESTION_TYPES = [
  { id: 'NOTICIA', label: 'NOTICIA', icon: '📰' },
  { id: 'REACCION', label: 'REACCION A VIDEO', img: '/v.png' },
  { id: 'JUEGO', label: 'JUEGO', icon: '🕹️' },
  { id: 'CHARLA', label: 'IDEA PARA CHARLA', icon: '💬' },
  { id: 'EVENTO', label: 'IDEA DE EVENTO', icon: '💡' },
  { id: 'OTROS', label: 'OTROS', img: '/gofre.png' }, 
];

export default function Sugerencias() {
  const { data: session, status: authStatus } = useSession(); 
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
        body: JSON.stringify(formData), 
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

  if (authStatus === 'loading') {
    return (
      <div className={`min-h-screen bg-[#0B0813] flex items-center justify-center ${mainFont.className}`}>
        <div className="text-[#F5C242] font-bold animate-pulse uppercase tracking-[0.5em]">Verificando acceso...</div>
      </div>
    );
  }

  return (
    // ✅ Aplicamos Space Grotesk a todo
    <main className={`min-h-screen bg-[#0B0813] text-white p-6 md:py-8 md:px-8 relative overflow-x-hidden flex flex-col justify-center ${mainFont.className}`}>
      <div className="fixed top-[10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-10 blur-[150px] bg-[#F5C242] pointer-events-none z-0" />

      <div className="max-w-[1000px] mx-auto w-full relative z-10 flex flex-col gap-4">
        
        <header className="flex flex-row justify-between items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-[#F5C242] tracking-tighter uppercase leading-none drop-shadow-lg">
              SUGERENCIAS
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em] mt-2">
              Ayúdame a mejorar el stream
            </p>
          </div>
          <Link href="/" className="px-5 py-3 rounded-xl text-[10px] font-bold uppercase border border-white/10 bg-white/5 hover:bg-white/10 hover:text-[#F5C242] transition-all flex items-center gap-2">
            ‹ Volver
          </Link>
        </header>

        {!session ? (
          <section className="bg-white/[0.02] backdrop-blur-2xl rounded-[2rem] p-8 border border-white/10 text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="text-5xl mb-1">🔒</div>
            <h2 className="text-2xl font-bold uppercase text-[#F5C242] tracking-tighter">Acceso Restringido</h2>
            <p className="text-gray-400 text-sm max-w-md font-medium">
              Para evitar el spam y mantener la calidad de las ideas, necesitas estar registrado para enviar sugerencias.
            </p>
            <Link 
              href="/login" 
              className="px-8 py-3.5 rounded-xl bg-[#F5C242] text-black font-bold uppercase hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,194,66,0.3)] mt-2"
            >
              Iniciar Sesión
            </Link>
          </section>
        ) : (
          <section className="bg-white/[0.02] backdrop-blur-2xl rounded-[2rem] p-6 md:p-8 border border-white/10 shadow-2xl shadow-black/50 relative overflow-hidden w-full">
            
            <form className="flex flex-col gap-5 relative z-10" onSubmit={handleSubmit}>
              
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-[#7A56B1] flex items-center justify-center font-bold text-white text-sm">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[9px] font-bold text-[#F5C242] uppercase tracking-[0.2em]">Enviando como:</p>
                  <p className="text-xs font-bold text-white">{session.user?.name} <span className="text-gray-500 font-medium ml-1 text-[10px]">({session.user?.email})</span></p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[#F5C242] uppercase tracking-[0.3em] ml-1">
                  TIPO DE SUGERENCIA ({currentTypeLabel})
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {SUGGESTION_TYPES.map((type) => {
                    const isSelected = formData.tipo === type.id;
                    return (
                      <motion.div
                        key={type.id}
                        onClick={() => setFormData({ ...formData, tipo: type.id })}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`group relative flex flex-col items-center justify-center gap-2 p-3 text-center cursor-pointer rounded-xl border transition-all duration-300 h-[90px]
                          ${isSelected ? 'bg-[#7A56B1]/20 border-[#7A56B1]/70 shadow-2xl shadow-[#7A56B1]/20' : 'bg-black/40 border-white/5 hover:border-[#F5C242]/50 hover:bg-white/5'}`}
                      >
                        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full border border-white/30 transition-all
                          ${isSelected ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]' : ''}`} />
                        
                        <div className="h-8 flex items-center justify-center">
                          {type.img ? (
                            <Image src={type.img} alt={type.label} width={28} height={28} className="object-contain" />
                          ) : (
                            <span className="text-3xl leading-none">{type.icon}</span>
                          )}
                        </div>

                        <span className={`text-[8px] font-bold uppercase tracking-widest leading-tight
                          ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                          {type.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="idea" className="text-[10px] font-bold text-[#F5C242] uppercase tracking-[0.3em] ml-1">
                  Descripción de la idea *
                </label>
                <textarea 
                  id="idea"
                  required
                  rows={4}
                  value={formData.idea}
                  onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                  placeholder="Escribe aquí de qué trata tu sugerencia... ¡Con todo lujo de detalles!"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-gray-200 placeholder:text-gray-600 focus:border-white/20 focus:ring-1 focus:ring-white/20 focus:bg-white/5 transition-all resize-none outline-none leading-relaxed"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-1">
                <div className="text-xs font-bold">
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
                  className={`px-8 py-3.5 rounded-xl font-bold uppercase text-xs tracking-[0.2em] transition-all flex items-center gap-3
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