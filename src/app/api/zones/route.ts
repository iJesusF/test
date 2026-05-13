import { zones } from '@/lib/mock-data';
import { created, ok } from '@/lib/api';

export async function GET() {
  return ok(zones);
}

export async function POST(request: Request) {
  const zone = await request.json();
  return created(zone);
}
