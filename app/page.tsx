'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';

//  FUENTE INTER
import { Inter } from 'next/font/google';
const logoFont = Inter({ subsets: ['latin'], weight: ['400', '500'] });

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: 'spring', stiffness: 100, damping: 15 } as const 
  },
};

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  //  ACTUALIZAR HORA CADA MINUTO
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = useMemo(() => {
    const d = currentTime;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [currentTime]);

 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        router.push('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // --- CARGAR EVENTOS ---
  useEffect(() => {
    fetch('/api/calendario')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setDbEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setDbEvents([]);
        setLoading(false);
      });
  }, []);

  //  LÓGICA DE DIRECTO INDEPENDIENTE
  const checkIsLive = (eventDate: string, horaInicio: string) => {
    if (!eventDate || !horaInicio) return false;
    const isToday = eventDate.split('T')[0] === todayStr;
    if (!isToday) return false;

    const [hStart, mStart] = horaInicio.split(':').map(Number);
    const ahora = currentTime;
    const inicio = new Date();
    inicio.setHours(hStart, mStart, 0);

    return ahora >= inicio; 
  };

  const [viewDate, setViewDate] = useState(new Date()); 
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null); 
  const [searchTerm, setSearchTerm] = useState('');

  const { monthName, year, daysArray, startOffset } = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const firstDayIndex = new Date(y, m, 1).getDay();
    return {
      monthName: viewDate.toLocaleString('es-ES', { month: 'long' }),
      year: y,
      daysArray: Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1),
      startOffset: firstDayIndex === 0 ? 6 : firstDayIndex - 1
    };
  }, [viewDate]);

  //  FILTRADO Y ORDENACIÓN
  const displayedEvents = useMemo(() => {
    const monthStr = String(viewDate.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}-${monthStr}`;
    
    let events = dbEvents.filter(e => e.fecha && e.fecha.startsWith(yearMonth));
    
    if (selectedDay) {
      const fullDateStr = `${yearMonth}-${String(selectedDay).padStart(2, '0')}`;
      events = events.filter(e => e.fecha.startsWith(fullDateStr));
    }
    
    if (searchTerm.trim()) {
      const low = searchTerm.toLowerCase();
      events = events.filter(e => e.titulo?.toLowerCase().includes(low));
    }
    
    return events.sort((a, b) => (a.hora_inicio || "").localeCompare(b.hora_inicio || ""));
  }, [selectedDay, viewDate, year, searchTerm, dbEvents]);

  const activeColor = useMemo(() => {
    const dayToTrack = hoveredDay || selectedDay;
    if (dayToTrack) {
      const dateStr = `${year}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(dayToTrack).padStart(2, '0')}`;
      const eventsOnDay = dbEvents.filter(e => e.fecha?.startsWith(dateStr));
      if (eventsOnDay.length === 0) return '#1a162e'; 
      if (dateStr === todayStr) {
        const isAnythingLive = eventsOnDay.some(e => checkIsLive(e.fecha, e.hora_inicio));
        return isAnythingLive ? '#EF4444' : '#7A56B1';
      }
      return '#7A56B1';
    }
    const todayEvents = dbEvents.filter(e => e.fecha?.startsWith(todayStr));
    const isAnythingLiveNow = todayEvents.some(e => checkIsLive(e.fecha, e.hora_inicio));
    return isAnythingLiveNow ? '#EF4444' : '#7A56B1';
  }, [selectedDay, hoveredDay, dbEvents, todayStr, year, viewDate, currentTime]);

  return (
    <main className="min-h-screen bg-[#0B0813] text-white px-4 py-6 md:px-12 md:pt-6 md:pb-12 font-sans select-none overflow-x-hidden relative">
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px] transition-colors duration-1000 pointer-events-none z-0" style={{ backgroundColor: activeColor }} />

      <div className="max-w-[1600px] mx-auto relative z-10">
        
        {/* SALUDO SESIÓN */}
        <div className="w-full flex justify-center mb-6">
          <AnimatePresence mode="wait">
            {session?.user && (
              <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} className="bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full flex items-center gap-5 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-300">
                  Bienvenido, <span className="text-[#F5C242]">{session.user.name || 'Gxfre User'}</span>
                </span>
                <button onClick={() => signOut()} className="ml-2 text-[10px] font-bold text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest border-l border-white/10 pl-4">Salir</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <header className="mb-12 flex flex-col xl:flex-row justify-between items-center gap-8 pb-8 border-b border-white/5 relative">
          <div className="flex flex-col sm:flex-row items-center gap-6 cursor-pointer xl:flex-1" onClick={() => { setSelectedDay(null); setSearchTerm(''); }}>
            <div className="relative w-24 h-24 flex items-center justify-center group"> 
              <div className="absolute inset-0 rounded-full blur-2xl opacity-10 transition-all duration-1000 group-hover:opacity-40 group-hover:scale-150" style={{ backgroundColor: activeColor }} />
              <Image src="/logo-gxfre.png" alt="Logo" fill sizes="96px" className="object-contain relative z-10 transition-transform duration-500 group-hover:scale-125" priority />
            </div>
            <div className="text-center sm:text-left">
              <h1 className={`text-4xl md:text-5xl tracking-wide uppercase transition-all duration-500 font-normal ${logoFont.className}`} style={{ color: activeColor === '#EF4444' ? '#EF4444' : 'white', textShadow: activeColor === '#EF4444' ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none' }}>GXFRE</h1>
              <p className={`text-[10px] text-gray-300 uppercase tracking-widest mt-1.5 font-medium ${logoFont.className}`}>CALENDARIO DE DIRECTOS Y EVENTOS DE GXFRE</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 xl:flex-none">
            <Link href="/votaciones" className="px-6 py-3 rounded-xl text-[10px] font-black uppercase italic border border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-lg">📊 Votaciones</Link>
            <Link href="/sugerencias" className="px-6 py-3 rounded-xl text-[10px] font-black uppercase italic border border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-lg">💡 Sugerencias</Link>
            {!session && ( <Link href="/login" className="px-6 py-3 rounded-xl text-[10px] font-black uppercase italic bg-[#F5C242] text-black hover:scale-105 transition-all shadow-lg">🔑 Entrar</Link> )}
          </div>

          <div className="flex flex-col items-center xl:items-end gap-6 xl:flex-1">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input type="text" placeholder="Buscar stream..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-xs font-bold outline-none transition-all" style={{ borderColor: `${activeColor}44` }} />
              </div>
              <button onClick={() => { setSelectedDay(null); setSearchTerm(''); }} className="px-5 py-3 rounded-full text-[10px] font-black uppercase italic bg-white/5 border border-white/10 hover:bg-white/10 transition-all">Ver todo</button>
              
              <div className="flex gap-2">
                <a href="https://twitch.tv/gxfre" target="_blank" className="w-10 h-10 flex items-center justify-center bg-[#9146FF]/10 border border-[#9146FF]/20 rounded-full hover:bg-[#9146FF] transition-all group/social">
                  <svg className="w-4 h-4 fill-[#9146FF] group-hover/social:fill-white" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                </a>
                <a href="https://youtube.com/@gxfre" target="_blank" className="w-10 h-10 flex items-center justify-center bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-full hover:bg-[#FF0000] transition-all group/social">
                  <svg className="w-4 h-4 fill-[#FF0000] group-hover/social:fill-white" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://x.com/gxfreee_on?s=21" target="_blank" className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white transition-all group/social">
                  <svg className="w-3.5 h-3.5 fill-white group-hover/social:fill-black" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z"/></svg>
                </a>
                <a href="https://www.instagram.com/gxfreee_on/" target="_blank" className="w-10 h-10 flex items-center justify-center bg-[#E1306C]/10 border border-[#E1306C]/20 rounded-full hover:bg-[#E1306C] transition-all group/social">
                  <svg className="w-4 h-4 fill-[#E1306C] group-hover/social:fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058-1.646.07 4.85-.07M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.2 4.353 2.612 6.765 6.963 6.965 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c4.351-.2 6.763-2.612 6.963-6.963.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.2-4.353-2.612-6.765-6.963-6.963C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://tiktok.com/@gxfre" target="_blank" className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all group/social">
                  <svg className="w-4 h-4 fill-white group-hover/social:fill-black" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.22-.32-2.57-.17-3.64.49-.99.61-1.62 1.69-1.72 2.83-.15 1.18.23 2.42 1.05 3.3.69.75 1.63 1.27 2.64 1.38.8.09 1.61-.07 2.3-.49.95-.57 1.58-1.54 1.74-2.62.03-3.69.01-7.38.02-11.07Z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-1000">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-black text-white uppercase italic leading-none">{monthName} <span className="text-[#F5C242]">{year}</span></h2>
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
                   <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors font-black text-lg">‹</button>
                   <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors font-black text-lg">›</button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">
                {['L','M','X','J','V','S','D'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: startOffset }).map((_, i) => <div key={i}></div>)}
                {daysArray.map(day => {
                  const dateStr = `${year}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const events = dbEvents.filter(e => e.fecha?.startsWith(dateStr));
                  const isAnyLive = events.some(e => checkIsLive(e.fecha, e.hora_inicio));
                  return (
                    <div key={day} 
                      onClick={() => setSelectedDay(day)}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`aspect-square flex items-center justify-center rounded-xl text-sm font-black cursor-pointer transition-all duration-300 relative ${selectedDay === day ? 'bg-white text-black scale-110 shadow-2xl z-10' : 'text-gray-200 hover:bg-white/10'}`}>
                      {day}
                      {events.length > 0 && !(selectedDay === day) && (
                        <div className="w-1.5 h-1.5 rounded-full absolute bottom-1.5" style={{ backgroundColor: isAnyLive ? '#EF4444' : '#7A56B1' }}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-9 flex flex-col gap-6">
            {/*  GRID AJUSTADO PARA TARJETAS PANORÁMICAS 16:9 */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8" variants={containerVariants} initial="hidden" animate="visible" key={`${displayedEvents.length}-${selectedDay}`}>
              <AnimatePresence mode='popLayout'>
                {displayedEvents.map(event => {
                  const eventDateStr = event.fecha?.split('T')[0];
                  const hStart = event.hora_inicio || event.hora_fin;
                  const isLiveNow = checkIsLive(event.fecha, hStart);
                  const isPast = eventDateStr < todayStr;
                  const eventDay = new Date(event.fecha).getDate();

                  return (
                    <motion.div key={event.id} variants={cardVariants} layout className={`group/card relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 transition-all duration-500 bg-[#120B21] shadow-2xl ${hoveredDay === eventDay ? 'scale-[1.02] border-white/40' : 'border-white/10'}`} >
                      <div className="absolute inset-0 z-0">
                        <img src={event.imagen_url} className="w-full h-full object-cover opacity-50 transition-all duration-1000 group-hover/card:scale-105" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0813] via-[#0B0813]/40 to-transparent" />
                      </div>

                      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-10 gap-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-max px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/20 backdrop-blur-md 
                            ${isLiveNow ? 'bg-red-600 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : isPast ? 'bg-gray-800 opacity-70' : 'bg-[#7A56B1]'}`}>
                            {isLiveNow ? '🔴 EN DIRECTO' : isPast ? 'FINALIZADO' : 'PRÓXIMAMENTE'}
                          </span>
                          
                          {hStart && !isLiveNow && !isPast && (
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-[#F5C242] border border-[#F5C242]/30 bg-black/40 backdrop-blur-md">
                              EMPIEZA A LAS {hStart}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter drop-shadow-lg uppercase leading-none mb-1">{event.titulo}</h3>
                        <p className="text-[10px] text-[#F5C242] font-black uppercase tracking-widest mb-1">{eventDay} de {new Date(event.fecha).toLocaleString('es-ES', { month: 'long' })}</p>
                        <p className="text-[11px] text-gray-400 font-medium line-clamp-1 leading-relaxed">{event.descripcion}</p>
                        
                        <div className="mt-3 flex gap-3 translate-y-4 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-500">
                          <a href={event.stream_url} target="_blank" className="flex-grow py-3.5 rounded-2xl font-black uppercase italic text-center text-[10px] bg-white text-black hover:bg-[#F5C242] transition-all shadow-xl">Ir al Directo</a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </section>
        </div>
      </div>
    </main>
  );
}