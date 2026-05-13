import { projectFromDb } from '@/lib/db-mappers';
import { getSupabaseAdmin, jsonError } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin().from('projects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return Response.json({ data: data.map(projectFromDb) });
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, error } = await getSupabaseAdmin().from('projects').insert({ name: body.name, code: body.code, status: body.status ?? 'not_started', progress: body.progress ?? 0 }).select('*').single();
    if (error) throw error;
    return Response.json({ data: projectFromDb(data) }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
