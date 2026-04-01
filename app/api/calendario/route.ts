import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // 1. CALCULAMOS LA FECHA DE CORTE (HACE 3 MESES / 90 DÍAS)
    const limiteLimpia = new Date();
    limiteLimpia.setDate(limiteLimpia.getDate() - 90); 
    const fechaCorte = limiteLimpia.toISOString().split('T')[0];

    // 2. BORRADO AUTOMÁTICO: Eliminamos lo que tenga más de 90 días
    await supabase
      .from('calendario')
      .delete()
      .lt('fecha', fechaCorte); 

    // 3. LECTURA: Traemos el resto de eventos
    // ✅ He añadido 'hora_inicio' al orden para que Supabase los mande ya organizados
    const { data, error } = await supabase
      .from('calendario')
      .select('*')
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true }); // <--- Orden secundario por hora

    if (error) {
      console.error("Error Supabase:", error.message);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (e) {
    console.error("Error en API:", e);
    return NextResponse.json([]);
  }
}