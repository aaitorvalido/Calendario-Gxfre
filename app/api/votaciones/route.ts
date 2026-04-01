import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// 🛡️ CONEXIÓN BLINDADA: Usamos la llave maestra para saltar el RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!; 

const supabase = createClient(supabaseUrl, supabaseKey);

// 1. LEER VOTOS Y COMPROBAR PARTICIPACIÓN (GET)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    const { data: opciones, error: errVotos } = await supabase
      .from('votaciones')
      .select('*')
      .order('id', { ascending: true });
    
    if (errVotos) throw errVotos;

    let haVotado = false;

    if (session?.user?.email && opciones && opciones.length > 0) {
      const idsActuales = opciones.map(o => String(o.id));

      const { data: registro } = await supabase
        .from('registro_votos')
        .select('voto_id')
        .eq('usuario_email', session.user.email)
        .in('voto_id', idsActuales)
        .maybeSingle();
      
      if (registro) haVotado = true;
    }

    return NextResponse.json({ opciones: opciones || [], haVotado });
  } catch (error) {
    console.error("Error en GET votaciones:", error);
    return NextResponse.json({ error: 'Error al cargar' }, { status: 500 });
  }
}

// 2. REGISTRAR VOTO ÚNICO (POST)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Debes estar logueado para votar" }, { status: 401 });
    }

    const { id } = await request.json(); 
    const idString = String(id);

    // Intentamos registrar el voto en la tabla bloqueada
    const { error: errReg } = await supabase
      .from('registro_votos')
      .insert([
        { 
          usuario_email: session.user.email, 
          voto_id: idString 
        }
      ]);

    if (errReg) {
      // Si el error es por duplicado, es que ya votó
      return NextResponse.json({ error: "Ya has participado en esta votación" }, { status: 400 });
    }

    // Si el registro fue OK, sumamos +1 al contador
    const { data: current } = await supabase
      .from('votaciones')
      .select('votos')
      .eq('id', idString)
      .single();

    const { error: errUpdate } = await supabase
      .from('votaciones')
      .update({ votos: (current?.votos || 0) + 1 })
      .eq('id', idString);

    if (errUpdate) throw errUpdate;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en POST votaciones:", error);
    return NextResponse.json({ error: 'Error al procesar el voto' }, { status: 500 });
  }
}