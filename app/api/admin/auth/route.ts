import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    const SECRET_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!SECRET_PASSWORD) {
      console.error("⚠️ Error: ADMIN_PASSWORD no configurada.");
      return NextResponse.json({ authenticated: false, error: "Configuración incompleta" }, { status: 500 });
    }

    if (password === SECRET_PASSWORD) {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
    
  } catch (error) {
    console.error("Error en el login de admin:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}