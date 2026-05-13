import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ data: [], message: 'Las zonas se guardan localmente en Zustand/localStorage para este MVP.' });
}

export async function POST() {
  return NextResponse.json({ error: 'CRUD local activo en cliente. Integra Supabase aquí para persistencia remota.' }, { status: 501 });
}
