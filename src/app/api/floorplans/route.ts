import { floorplanFromDb } from '@/lib/db-mappers';
import { getSupabaseAdmin, jsonError } from '@/lib/supabase-server';

const bucket = process.env.SUPABASE_FLOORPLANS_BUCKET ?? 'floorplans';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    let query = getSupabaseAdmin().from('floorplans').select('*').order('created_at', { ascending: false });
    const projectId = url.searchParams.get('project_id');
    const levelId = url.searchParams.get('level_id');
    if (projectId) query = query.eq('project_id', projectId);
    if (levelId) query = query.eq('level_id', levelId);
    const { data, error } = await query;
    if (error) throw error;
    return Response.json({ data: data.map(floorplanFromDb) });
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return Response.json({ error: 'file is required' }, { status: 400 });
    const projectId = String(form.get('project_id') ?? '');
    if (!projectId) return Response.json({ error: 'project_id is required' }, { status: 400 });
    const levelId = form.get('level_id') ? String(form.get('level_id')) : null;
    const width = Number(form.get('width') ?? 1);
    const height = Number(form.get('height') ?? 1);
    const fileType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
    const extension = file.name.split('.').pop() || (fileType === 'pdf' ? 'pdf' : 'png');
    const storagePath = `${projectId}/${levelId ?? 'unassigned'}/${crypto.randomUUID()}.${extension}`;

    const supabase = getSupabaseAdmin();
    const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, file, { upsert: false, contentType: file.type || undefined });
    if (uploadError) throw uploadError;
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(storagePath);

    const { data, error } = await supabase.from('floorplans').insert({ project_id: projectId, level_id: levelId, name: String(form.get('name') ?? file.name), storage_path: storagePath, public_url: publicData.publicUrl, file_type: fileType, width, height, revision: form.get('revision') ?? 'A' }).select('*').single();
    if (error) throw error;
    return Response.json({ data: floorplanFromDb(data) }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
