'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function VotacionesPage() {
  const { data: session, status: authStatus } = useSession(); // 🛡️ Hook de sesión
  const [opciones, setOpciones] = useState<any[]>([]);
  const [info, setInfo] = useState({ titulo: "CARGANDO...", descripcion: "Preparando votación..." });
  const [yaVoto, setYaVoto] = useState(false);
  const [loading, setLoading] = useState(true);

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
      if (dataInfo) setInfo({ titulo: dataInfo.titulo, descripcion: dataInfo.descripcion });
      
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

  const totalVotos = useMemo(() => opciones.reduce((acc, curr) => acc + (curr.votos || 0), 0), [opciones]);

  const handleVote = async (id: string) => {
    if (yaVoto || authStatus !== 'authenticated') return;
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

  // 1. Pantalla de carga mientras verifica sesión
  if (authStatus === 'loading' || (authStatus === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen bg-[#0B0813] flex items-center justify-center">
        <div className="text-[#F5C242] font-black animate-pulse uppercase tracking-[0.5em]">Verificando acceso...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0813] text-white p-8 md:p-24 relative overflow-hidden">
      {/* Brillo de fondo */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[120px] bg-[#7A56B1] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className="text-gray-500 hover:text-white text-[10px] font-black uppercase italic tracking-[0.3em] transition-colors">
            ‹ Volver al inicio
          </Link>
          {yaVoto && authStatus === 'authenticated' && (
            <span className="bg-green-500/20 text-green-400 text-[9px] font-black px-4 py-2 rounded-full border border-green-500/30 tracking-widest uppercase">
              ✓ Voto registrado
            </span>
          )}
        </div>

        {/* 🛡️ LÓGICA DE ACCESO: Si no está logueado, mostramos el mensaje de registro */}
        {authStatus === 'unauthenticated' ? (
          <section className="bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] p-12 border border-white/10 text-center flex flex-col items-center gap-6 shadow-2xl">
            <div className="text-6xl mb-2">🔒</div>
            <h2 className="text-3xl font-black uppercase italic text-[#F5C242] tracking-tighter">Votación Restringida</h2>
            <p className="text-gray-400 max-w-md font-bold italic">
              Para asegurar que los resultados sean reales y justos, necesitas una cuenta para poder votar.
            </p>
            <Link 
              href="/login" 
              className="px-12 py-5 rounded-2xl bg-[#F5C242] text-black font-black uppercase italic hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,194,66,0.3)] mt-4"
            >
              Iniciar Sesión para Votar
            </Link>
          </section>
        ) : (
          /* ✅ CONTENIDO PARA USUARIOS LOGUEADOS */
          <>
            <header className="mb-16">
              <h1 className="text-5xl md:text-7xl font-black italic uppercase text-[#F5C242] mb-6 tracking-tighter leading-none">
                {info.titulo}
              </h1>
              <p className="text-gray-400 font-bold italic text-lg border-l-4 border-[#7A56B1] pl-6 bg-white/5 py-3 rounded-r-2xl">
                {info.descripcion}
              </p>
            </header>

            <div className="grid gap-6">
              {opciones.map((opt) => {
                const porcentaje = totalVotos === 0 ? 0 : Math.round((opt.votos / totalVotos) * 100);
                return (
                  <motion.button 
                    key={opt.id} 
                    disabled={yaVoto} 
                    onClick={() => handleVote(opt.id)} 
                    className={`relative overflow-hidden p-8 rounded-[2.5rem] border flex items-center justify-between transition-all group ${
                      yaVoto ? 'border-white/5 bg-white/[0.02] cursor-default' : 'border-white/10 bg-white/5 hover:border-[#F5C242]/50'
                    }`}
                  >
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${porcentaje}%` }} 
                      className={`absolute inset-y-0 left-0 ${yaVoto ? 'bg-white/5' : 'bg-[#7A56B1]/20'}`} 
                    />
                    
                    <div className="relative z-10 text-left">
                      <span className={`text-3xl font-black italic uppercase ${yaVoto ? 'text-gray-500' : 'text-white'}`}>
                        {opt.label}
                      </span>
                      <span className="block text-[10px] font-black text-gray-500 uppercase mt-1 tracking-widest">
                        {opt.votos} Votos
                      </span>
                    </div>

                    <div className="relative z-10">
                      <span className={`text-5xl font-black italic ${yaVoto ? 'text-gray-600' : 'text-white group-hover:text-[#F5C242] transition-colors'}`}>
                        {porcentaje}%
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            <p className="text-center mt-12 text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">
              Resultados actualizados en tiempo real
            </p>
          </>
        )}
      </div>
    </main>
  );
}