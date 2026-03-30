'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// 🚀 ESTÉTICA TECH/GAMING: Space Grotesk
import { Space_Grotesk } from 'next/font/google';
const mainFont = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export default function VotacionesPage() {
  const { data: session, status: authStatus } = useSession();
  const [opciones, setOpciones] = useState<any[]>([]);
  const [info, setInfo] = useState({ titulo: "CARGANDO...", descripcion: "Preparando votación...", fecha_cierre: "" });
  const [yaVoto, setYaVoto] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- ESTADO DE LA CUENTA ATRÁS ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, finalizado: false });

  const fetchDatos = async () => {
    try {
      const [resVotos, resInfo] = await Promise.all([
        fetch('/api/votaciones'), 
        fetch('/api/votaciones-info')
      ]);
      const dataVotos = await resVotos.json();
      const dataInfo = await resInfo.json();
      
      if (dataVotos.opciones) setOpciones(dataVotos.opciones);
      if (dataVotos.haVotado) setYaVoto(true);
      if (dataInfo) setInfo({ 
        titulo: dataInfo.titulo, 
        descripcion: dataInfo.descripcion,
        fecha_cierre: dataInfo.fecha_cierre 
      });
      
      setLoading(false);
    } catch (e) { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchDatos();
      const interval = setInterval(fetchDatos, 5000);
      return () => clearInterval(interval);
    }
  }, [authStatus]);

  // ✅ LÓGICA DE LA CUENTA ATRÁS (CON FIX DEFINITIVO PARA EL DESFASE DE 1 HORA)
  useEffect(() => {
    if (!info.fecha_cierre) return;

    const timer = setInterval(() => {
      const ahora = new Date().getTime();
      
      // Forzamos que la fecha se lea como local eliminando el indicador UTC (Z)
      const fechaLimpia = info.fecha_cierre.replace('Z', '').split('+')[0];
      const cierre = new Date(fechaLimpia).getTime();
      
      const diferencia = cierre - ahora;

      if (diferencia <= 0) {
        setTimeLeft(prev => ({ ...prev, finalizado: true }));
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(diferencia / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diferencia / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diferencia / 1000 / 60) % 60),
          seconds: Math.floor((diferencia / 1000) % 60),
          finalizado: false
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [info.fecha_cierre]);

  const totalVotos = useMemo(() => opciones.reduce((acc, curr) => acc + (curr.votos || 0), 0), [opciones]);

  const ganadorActual = useMemo(() => {
    if (opciones.length === 0 || totalVotos === 0) return null;
    const maxVotos = Math.max(...opciones.map(opt => opt.votos || 0));
    if (maxVotos === 0) return null;
    const lideres = opciones.filter(opt => (opt.votos || 0) === maxVotos);
    return lideres.length === 1 ? lideres[0] : null;
  }, [opciones, totalVotos]);

  const handleVote = async (id: string) => {
    if (yaVoto || timeLeft.finalizado || authStatus !== 'authenticated') return;
    const res = await fetch('/api/votaciones', {
      method: 'POST',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) { 
      setYaVoto(true); 
      fetchDatos(); 
    } else { 
      const err = await res.json(); 
      alert(err.error); 
    }
  };

  if (authStatus === 'loading' || (authStatus === 'authenticated' && loading)) {
    return (
      <div className={`min-h-screen bg-[#0B0813] flex items-center justify-center ${mainFont.className}`}>
        <div className="text-[#F5C242] font-bold animate-pulse uppercase tracking-[0.5em]">Verificando acceso...</div>
      </div>
    );
  }

  return (
    <main className={`min-h-screen bg-[#0B0813] text-white p-6 md:py-10 md:px-8 relative overflow-hidden flex flex-col justify-center ${mainFont.className}`}>
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[120px] bg-[#7A56B1] pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full relative z-10">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <AnimatePresence>
              {ganadorActual && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-[#F5C242]/10 text-[#F5C242] text-xs md:text-sm font-bold px-6 py-3 rounded-xl border border-[#F5C242]/40 tracking-widest uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(245,194,66,0.25)]"
                >
                  <span className="text-lg">👑</span> Liderando: {ganadorActual.label}
                </motion.div>
              )}
            </AnimatePresence>

             {yaVoto && authStatus === 'authenticated' && (
              <span className="bg-green-500/20 text-green-400 text-[9px] font-bold px-3 py-2.5 rounded-lg border border-green-500/30 tracking-widest uppercase mt-1 sm:mt-0">
                ✓ Voto registrado
              </span>
            )}
          </div>
          
          <Link href="/" className="px-6 py-3 rounded-xl text-xs font-bold uppercase border border-white/10 bg-white/5 hover:bg-white/10 hover:text-[#F5C242] transition-all flex items-center gap-2 shrink-0 ml-4">
            ‹ Volver
          </Link>
        </div>

        {authStatus === 'unauthenticated' ? (
          <section className="bg-white/[0.02] backdrop-blur-2xl rounded-[2rem] p-8 border border-white/10 text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="text-5xl mb-1">🔒</div>
            <h2 className="text-2xl font-bold uppercase text-[#F5C242] tracking-tighter">Votación Restringida</h2>
            <p className="text-gray-400 text-sm max-w-md font-medium">Para asegurar que los resultados sean reales y justos, necesitas una cuenta para poder votar.</p>
            <Link href="/login" className="px-8 py-3.5 rounded-xl bg-[#F5C242] text-black font-bold uppercase hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,194,66,0.3)] mt-2">Iniciar Sesión</Link>
          </section>
        ) : (
          <>
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold uppercase text-[#F5C242] mb-3 tracking-tighter leading-none">{info.titulo}</h1>
              <p className="text-gray-400 font-medium text-sm md:text-base border-l-4 border-[#7A56B1] pl-4 bg-white/5 py-2 rounded-r-xl">{info.descripcion}</p>
            </header>

            {/* ⏳ CUENTA ATRÁS VISUAL */}
            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 mb-8 backdrop-blur-md relative overflow-hidden flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-4">Tiempo restante:</span>
              {!timeLeft.finalizado ? (
                <div className="flex gap-4 md:gap-8 items-center">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-black tabular-nums">{timeLeft.days}</span>
                    <span className="text-[8px] uppercase font-bold text-[#F5C242]/60 mt-1">Días</span>
                  </div>
                  <span className="text-xl font-bold opacity-20 mb-4">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-black tabular-nums">{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] uppercase font-bold text-[#F5C242]/60 mt-1">Horas</span>
                  </div>
                  <span className="text-xl font-bold opacity-20 mb-4">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-black tabular-nums">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] uppercase font-bold text-[#F5C242]/60 mt-1">Min</span>
                  </div>
                  <span className="text-xl font-bold opacity-20 mb-4">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-black tabular-nums text-[#F5C242] animate-pulse">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] uppercase font-bold text-white/40 mt-1">Seg</span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/10 text-red-500 px-6 py-2 rounded-full border border-red-500/20 text-xs font-bold uppercase tracking-widest">
                  ⚠️ Votación Finalizada
                </div>
              )}
            </div>

            <div className="grid gap-3">
              {opciones.map((opt) => {
                const porcentaje = totalVotos === 0 ? 0 : Math.round((opt.votos / totalVotos) * 100);
                const esLider = ganadorActual?.id === opt.id;

                return (
                  <motion.button 
                    key={opt.id} 
                    disabled={yaVoto || timeLeft.finalizado} 
                    onClick={() => handleVote(opt.id)} 
                    className={`relative overflow-hidden p-4 md:p-5 rounded-[1.5rem] border flex items-center justify-between transition-all group ${
                      (yaVoto || timeLeft.finalizado) 
                        ? (esLider ? 'border-[#F5C242]/30 bg-white/[0.04]' : 'border-white/5 bg-white/[0.02] cursor-default') 
                        : 'border-white/10 bg-white/5 hover:border-[#F5C242]/50'
                    }`}
                  >
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${porcentaje}%` }} 
                      className={`absolute inset-y-0 left-0 ${(yaVoto || timeLeft.finalizado) ? (esLider ? 'bg-[#F5C242]/10' : 'bg-white/5') : 'bg-[#7A56B1]/20'}`} 
                    />
                    
                    <div className="relative z-10 text-left">
                      <span className={`text-xl md:text-2xl font-bold uppercase ${(yaVoto || timeLeft.finalizado) ? (esLider ? 'text-[#F5C242]' : 'text-gray-500') : 'text-white'}`}>
                        {opt.label}
                      </span>
                      <span className={`block text-[10px] font-bold uppercase mt-0.5 tracking-widest ${esLider && (yaVoto || timeLeft.finalizado) ? 'text-[#F5C242]/70' : 'text-gray-500'}`}>
                        {opt.votos} Votos
                      </span>
                    </div>

                    <div className="relative z-10">
                      <span className={`text-3xl md:text-4xl font-bold ${(yaVoto || timeLeft.finalizado) ? (esLider ? 'text-[#F5C242]' : 'text-gray-600') : 'text-white group-hover:text-[#F5C242] transition-colors'}`}>
                        {porcentaje}%
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            <p className="text-center mt-6 text-[10px] text-gray-600 font-bold uppercase tracking-[0.4em]">
              Resultados actualizados en tiempo real
            </p>
          </>
        )}
      </div>
    </main>
  );
}