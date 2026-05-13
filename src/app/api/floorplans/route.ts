import { floorplan } from '@/lib/mock-data';
import { created, ok } from '@/lib/api';

export async function GET() {
  return ok([floorplan]);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  return created({ ...floorplan, name: file instanceof File ? file.name : floorplan.name });
}
