import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
// ✅ CAMBIO AQUÍ: Ahora importamos desde /options
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { titulo, descripcion, opciones } = body;

    // 1. Actualizar Título y Descripción (Tabla votaciones_info)
    if (titulo || descripcion) {
      const { error: errInfo } = await supabase
        .from('votaciones_info')
        .update({ titulo, descripcion })
        .eq('id', 1);
      if (errInfo) console.error("Error al actualizar info:", errInfo.message);
    }

    // 2. RESET TOTAL: Borramos votos antiguos y opciones antiguas
    await supabase.from('registro_votos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('votaciones').delete().neq('label', 'SISTEMA_RESERVA');

    // 3. Insertar las nuevas opciones
    if (opciones && Array.isArray(opciones)) {
      const nuevasOpciones = opciones
        .filter((opt: string) => opt && opt.trim() !== "")
        .map((opt: string) => ({
          label: opt,
          votos: 0
        }));

      if (nuevasOpciones.length > 0) {
        const { error: errInsert } = await supabase
          .from('votaciones')
          .insert(nuevasOpciones);

        if (errInsert) {
          console.error("Error al insertar opciones:", errInsert.message);
          throw errInsert;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error completo en Admin API:", error);
    return NextResponse.json({ error: error.message || "Error al publicar" }, { status: 500 });
  }
}

export async function GET() {
  const { data } = await supabase.from('votaciones').select('*').order('id', { ascending: true });
  return NextResponse.json(data || []);
}