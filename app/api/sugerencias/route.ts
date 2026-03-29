import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getServerSession } from "next-auth/next";
// ✅ CAMBIO AQUÍ: Importamos desde /options
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // 🛡️ 1. VERIFICAR SESIÓN (Bloqueo de seguridad)
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para enviar sugerencias' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tipo, idea } = body;

    // Validación básica de contenido
    if (!idea || !tipo) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Usamos los datos REALES de la sesión, no los del body
    const nombreUsuario = session.user.name || 'Usuario Gxfre';
    const emailUsuario = session.user.email || 'Sin email';

    // 2. === GUARDAR EN SUPABASE ===
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY; 

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error: supabaseError } = await supabase
        .from('sugerencias')
        .insert([{ 
          nombre: nombreUsuario, 
          tipo: tipo, 
          idea: idea, 
          email: emailUsuario 
        }]);

      if (supabaseError) {
        console.error('Error de Supabase al insertar:', supabaseError);
      }
    }

    // 3. === ENVIAR EL CORREO CON RESEND ===
    await resend.emails.send({
      from: 'Sugerencias Stream <onboarding@resend.dev>',
      to: ['aitorvalidogonzalez@gmail.com'], 
      subject: `💡 Nueva sugerencia de ${nombreUsuario}: ${tipo}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #7A56B1;">¡Tienes una nueva sugerencia!</h2>
          <p>Enviada por un usuario registrado en Calendario.TV:</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin-top: 20px;">
            <p><strong>👤 Nick / Nombre:</strong> ${nombreUsuario}</p>
            <p><strong>🏷️ Categoría:</strong> ${tipo}</p>
            <p><strong>✉️ Correo de cuenta:</strong> ${emailUsuario}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><strong>💡 La Idea:</strong></p>
            <p style="white-space: pre-wrap; color: #333;">${idea}</p>
          </div>
          <p style="font-size: 10px; color: #aaa; margin-top: 20px;">Sugerencia verificada mediante sesión de usuario.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: 'Sugerencia enviada correctamente' });

  } catch (error) {
    console.error('❌ Error procesando la sugerencia:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}