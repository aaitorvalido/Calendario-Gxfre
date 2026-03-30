import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Conexión a tu Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

// --- GUARDAR NUEVO EVENTO ---
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { error } = await supabase.from('calendario').insert([
      { 
        titulo: data.titulo,
        fecha: data.fecha,
        descripcion: data.descripcion,
        stream_url: data.stream_url,
        imagen_url: data.imagen_base64 
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

// --- BORRAR EVENTO ---
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Falta el ID del evento" }, { status: 400 });
    }

    const { error } = await supabase.from('calendario').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Evento borrado" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Error al borrar el evento" }, { status: 500 });
  }
}