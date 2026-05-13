import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ data: [], message: 'La versión local del MVP persiste proyectos en localStorage mediante Zustand.' });
}
