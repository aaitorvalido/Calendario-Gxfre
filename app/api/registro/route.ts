import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

// 🛠️ AJUSTE AQUÍ: Usamos SECRET_KEY que es la que tienes en tu .env
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { usuario, email, password } = await request.json();

    if (!usuario || !email || !password) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('usuarios')
      .insert([
        { 
          usuario: usuario.trim(), 
          email: email.trim().toLowerCase(), 
          password: hashedPassword 
        }
      ]);

    if (error) {
      console.error("Error de Supabase:", error);
      if (error.code === '23505') {
        return NextResponse.json({ error: "El usuario o email ya están registrados" }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Usuario creado" }, { status: 201 });

  } catch (err) {
    console.error("Error fatal en API:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}