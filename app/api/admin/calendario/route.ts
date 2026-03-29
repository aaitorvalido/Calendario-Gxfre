import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Conexión a tu Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Insertamos los datos en la tabla 'calendario'
    const { error } = await supabase.from('calendario').insert([
      { 
        titulo: data.titulo,
        fecha: data.fecha,
        descripcion: data.descripcion,
        stream_url: data.stream_url,
        imagen_url: data.imagen_base64 // Aquí guardamos la foto que recortaste
      }
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}