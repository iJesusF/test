import { zoneFromDb } from '@/lib/db-mappers';
import { getSupabaseAdmin, jsonError } from '@/lib/supabase-server';

type ZonePatchPayload = Record<string, string | number | unknown[] | undefined>;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();
    const payload: ZonePatchPayload = {
      name: body.name,
      color: body.color,
      status: body.status,
      progress: body.progress,
      notes: body.notes,
      responsible: body.responsible,
      start_date: body.startDate,
      end_date: body.endDate,
      polygon: body.points,
      checklist: body.checklist,
      tags: body.tags,
      priority: body.priority,
      updated_at: new Date().toISOString()
    };

    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    const { data, error } = await supabase.from('zones').update(payload).eq('id', params.id).select('*').single();
    if (error) throw error;
    await supabase.from('tasks').update({ name: data.name, status: data.status, progress: data.progress, start_date: data.start_date, end_date: data.end_date }).eq('zone_id', params.id);
    return Response.json({ data: zoneFromDb(data) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await getSupabaseAdmin().from('zones').delete().eq('id', params.id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
