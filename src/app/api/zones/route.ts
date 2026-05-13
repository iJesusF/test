import { taskFromDb, zoneFromDb } from '@/lib/db-mappers';
import { getSupabaseAdmin, jsonError } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try { const floorplanId = new URL(request.url).searchParams.get('floorplan_id'); let query = getSupabaseAdmin().from('zones').select('*').order('created_at'); if (floorplanId) query = query.eq('floorplan_id', floorplanId); const { data, error } = await query; if (error) throw error; return Response.json({ data: data.map(zoneFromDb) }); } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();
    const payload = { floorplan_id: body.floorplanId, code: body.code ?? `Z-${Date.now()}`, name: body.name, color: body.color, status: body.status, progress: body.progress, notes: body.notes, responsible: body.responsible, start_date: body.startDate, end_date: body.endDate, polygon: body.points, checklist: body.checklist ?? [], tags: body.tags ?? [], priority: body.priority };
    const { data: zone, error } = await supabase.from('zones').insert(payload).select('*').single();
    if (error) throw error;
    const { data: floorplan } = await supabase.from('floorplans').select('project_id').eq('id', body.floorplanId).single();
    let task = null;
    if (floorplan?.project_id) {
      const { data: insertedTask } = await supabase.from('tasks').insert({ project_id: floorplan.project_id, zone_id: zone.id, name: zone.name, status: zone.status, progress: zone.progress, start_date: zone.start_date, end_date: zone.end_date }).select('*').single();
      task = insertedTask ? taskFromDb(insertedTask) : null;
    }
    return Response.json({ data: zoneFromDb(zone), task }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
