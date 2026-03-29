'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';

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

  // ✅ FECHA DINÁMICA: Detecta el día actual automáticamente
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // --- ⌨️ ACCESO SECRETO AL PANEL (Ctrl + Shift + A) ---
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

  const futureEvents = useMemo(() => {
    return dbEvents
      .filter(e => e.fecha >= todayStr)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 3);
  }, [dbEvents, todayStr]);

  const displayedEvents = useMemo(() => {
    const monthStr = String(viewDate.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}-${monthStr}`;
    let events = dbEvents.filter(e => e.fecha && e.fecha.startsWith(yearMonth));
    if (selectedDay) {
      events = events.filter(e => e.fecha === `${yearMonth}-${String(selectedDay).padStart(2, '0')}`);
    }
    if (searchTerm.trim()) {
      const low = searchTerm.toLowerCase();
      events = events.filter(e => e.titulo?.toLowerCase().includes(low));
    }
    return events;
  }, [selectedDay, viewDate, year, searchTerm, dbEvents]);

  const activeColor = useMemo(() => {
    const dayToTrack = hoveredDay || selectedDay;
    if (dayToTrack) {
      const dateStr = `${year}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(dayToTrack).padStart(2, '0')}`;
      if (dateStr === todayStr) return '#EF4444';
      const hasEvent = dbEvents.some(e => e.fecha === dateStr);
      return hasEvent ? '#7A56B1' : '#1a162e';
    }
    return dbEvents.some(e => e.fecha === todayStr) ? '#EF4444' : '#7A56B1';
  }, [selectedDay, hoveredDay, dbEvents, todayStr, year, viewDate]);

  return (
    <main className="min-h-screen bg-[#0B0813] text-white p-4 md:p-12 font-sans select-none overflow-x-hidden relative">
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px] transition-colors duration-1000 pointer-events-none z-0" style={{ backgroundColor: activeColor }} />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="w-full flex justify-center mb-12">
          <AnimatePresence mode="wait">
            {session?.user && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full flex items-center gap-5 shadow-[0_0_40px_rgba(0,0,0,0.4)] group cursor-default"
              >
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
              <Image src="/logo-gxfre.png" alt="Logo" fill sizes="96px" className="object-contain relative z-10 transition-transform duration-500 ease-out group-hover:scale-125" priority />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.8] transition-all duration-500" style={{ color: activeColor === '#EF4444' ? '#EF4444' : 'white', textShadow: activeColor === '#EF4444' ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none' }}>GXFRE</h1>
              <p className="text-[12px] text-[#F5C242] font-black uppercase tracking-[0.6em] mt-2 italic">CALENDARIO</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 xl:flex-none">
            <Link href="/votaciones" className="px-6 py-3 rounded-xl text-[10px] font-black uppercase italic border border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-lg">📊 Votaciones</Link>
            <Link href="/sugerencias" className="px-6 py-3 rounded-xl text-[10px] font-black uppercase italic border border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-lg">💡 Sugerencias</Link>
            {!session && ( <Link href="/login" className="px-6 py-3 rounded-xl text-[10px] font-black uppercase italic bg-[#F5C242] text-black hover:scale-105 transition-all shadow-lg">🔑 Entrar</Link> )}
          </div>

          <div className="flex flex-col items-center xl:items-end gap-6 xl:flex-1">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <input type="text" placeholder="Buscar stream..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-xs font-bold outline-none transition-all" style={{ borderColor: `${activeColor}44` }} />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setSelectedDay(null)} className="px-6 py-3 rounded-xl text-[10px] font-black uppercase italic bg-white/5 border border-white/10 hover:bg-white/10 transition-all">Ver todo</button>
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner">
                 <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="px-2 hover:text-[#F5C242] transition-colors font-bold">‹</button>
                 <span className="px-4 font-black uppercase italic text-sm min-w-[140px] text-center">{monthName} {year}</span>
                 <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="px-2 hover:text-[#F5C242] transition-colors font-bold">›</button>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-1000">
              <div className="absolute top-0 left-0 w-full h-1 opacity-50 transition-colors duration-1000" style={{ backgroundColor: activeColor }}></div>
              <h2 className="text-2xl font-black text-white uppercase italic mb-6 capitalize">{monthName}</h2>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">
                {['L','M','X','J','V','S','D'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: startOffset }).map((_, i) => <div key={i}></div>)}
                {daysArray.map(day => {
                  const dateStr = `${year}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const hasEvent = dbEvents.some(e => e.fecha === dateStr);
                  const isToday = dateStr === todayStr;
                  return (
                    <div key={day} 
                      onClick={() => setSelectedDay(day)}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`aspect-square flex items-center justify-center rounded-xl text-sm font-black cursor-pointer transition-all duration-300 relative ${selectedDay === day ? 'bg-white text-black scale-110 shadow-2xl z-10' : 'text-gray-200 hover:bg-white/10'}`}>
                      {day}
                      {hasEvent && !(selectedDay === day) && (
                        <div className="w-1.5 h-1.5 rounded-full absolute bottom-1.5" style={{ backgroundColor: isToday ? '#EF4444' : '#7A56B1' }}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-9 flex flex-col gap-6">
            <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="visible" key={displayedEvents.length}>
              <AnimatePresence mode='popLayout'>
                {displayedEvents.map(event => {
                  const isLive = event.fecha === todayStr;
                  const eventDay = new Date(event.fecha).getDate();
                  return (
                    <motion.div key={event.id} variants={cardVariants} layout className="group/card relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 transition-all duration-500 bg-[#120B21] shadow-2xl" >
                      <div className="absolute inset-0 z-0">
                        <img src={event.imagen_url} className="w-full h-full object-cover opacity-40 group-hover/card:scale-110 transition-all duration-1000" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0813] via-transparent to-transparent" />
                      </div>
                      <div className="absolute inset-0 p-8 flex flex-col justify-end z-10 gap-2">
                        <span className={`w-max px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/20 backdrop-blur-md ${isLive ? 'bg-red-600 animate-pulse' : 'bg-white/10'}`}> {isLive ? '🔴 EN DIRECTO' : 'PRÓXIMAMENTE'} </span>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter drop-shadow-lg uppercase leading-none mb-1">{event.titulo}</h3>
                        <p className="text-xs text-[#F5C242] font-black uppercase tracking-widest mb-1">{eventDay} de {new Date(event.fecha).toLocaleString('es-ES', { month: 'long' })}</p>
                        <p className="text-[11px] text-gray-400 font-medium line-clamp-2 leading-relaxed">{event.descripcion}</p>
                        <div className="mt-4 flex gap-3 translate-y-4 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-500">
                          <a href={event.stream_url} target="_blank" className="flex-grow py-4 rounded-2xl font-black uppercase italic text-center text-[10px] bg-white text-black hover:bg-[#F5C242] transition-all shadow-xl">Ir al Directo</a>
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