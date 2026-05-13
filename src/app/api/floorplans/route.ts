import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ data: [], message: 'Los planos se cargan y persisten localmente en el navegador para este MVP.' });
}

export async function POST() {
  return NextResponse.json({ error: 'Upload local activo en cliente. Integra Supabase Storage aquí para persistencia remota.' }, { status: 501 });
}
