import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ data: { tasks: [], dependencies: [] }, message: 'Las tareas se derivan localmente de las zonas dibujadas.' });
}
