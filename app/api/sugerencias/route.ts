import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// 🔑 Inicializamos Resend con la variable de entorno RESEND_API_KEY
// Recuerda actualizar esta clave en Vercel con la de la nueva cuenta
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // 🛡️ 1. VERIFICAR SESIÓN (Solo usuarios registrados pueden enviar ideas)
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para enviar sugerencias' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tipo, idea } = body;

    // Validación de campos vacíos
    if (!idea || !tipo) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const nombreUsuario = session.user.name || 'Usuario Gxfre';
    const emailUsuario = session.user.email || 'Sin email';

    // 2. === GUARDAR EN SUPABASE (Historial de respaldo) ===
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

      if (supabaseError) console.error('Error en Supabase:', supabaseError);
    }

    // 3. === ENVIAR EL CORREO A LA CUENTA DEL CLIENTE ===
    // Importante: Al ser la cuenta de csoulgabrieldlc@gmail.com, 
    // Resend permite el envío a sí mismo sin verificar dominio.
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Gxfre Sugerencias <onboarding@resend.dev>',
        to: ['csoulgabrieldlc@gmail.com'], 
        subject: `💡 [Sugerencia] ${nombreUsuario} - ${tipo}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #0B0813; border-radius: 28px; color: white; border: 1px solid #1A1625;">
            <div style="text-align: center; margin-bottom: 25px;">
              <span style="background: #F5C242; color: #000; padding: 6px 14px; border-radius: 10px; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Buzón de Ideas</span>
            </div>
            
            <h2 style="color: #F5C242; text-align: center; font-size: 26px; text-transform: uppercase; margin-bottom: 35px; letter-spacing: -1px;">Nueva Propuesta</h2>
            
            <div style="background-color: rgba(255,255,255,0.04); padding: 30px; border-radius: 22px; border: 1px solid rgba(245,194,66,0.2);">
              <div style="margin-bottom: 20px;">
                <p style="margin: 0; color: #7A56B1; font-weight: bold; font-size: 12px; text-transform: uppercase;">👤 Enviado por:</p>
                <p style="margin: 5px 0 0 0; color: #fff; font-size: 16px;">${nombreUsuario}</p>
              </div>

              <div style="margin-bottom: 20px;">
                <p style="margin: 0; color: #7A56B1; font-weight: bold; font-size: 12px; text-transform: uppercase;">🏷️ Categoría:</p>
                <p style="margin: 5px 0 0 0; color: #fff; font-size: 16px;">${tipo}</p>
              </div>

              <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid rgba(255,255,255,0.1);">
                <p style="color: #F5C242; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Contenido de la sugerencia:</p>
                <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 15px; color: #eee; line-height: 1.7; font-style: italic; border-left: 4px solid #7A56B1; font-size: 15px;">
                  "${idea}"
                </div>
              </div>
            </div>
            
            <div style="margin-top: 40px; text-align: center;">
               <p style="font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 4px; margin: 0;">
                Gxfre • Calendario TV
              </p>
              <p style="font-size: 9px; color: #333; margin-top: 5px;">Usuario registrado: ${emailUsuario}</p>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true, message: 'Sugerencia enviada correctamente' });

  } catch (error) {
    console.error('❌ Error crítico en el proceso:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}