import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!; 

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('votaciones_info')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error cargando info de votaciones:", error);
    // Fallback por si la base de datos no responde o la tabla está vacía
    return NextResponse.json({ 
      titulo: "VOTACIONES", 
      descripcion: "Cargando encuesta...",
      fecha_cierre: null 
    });
  }
}