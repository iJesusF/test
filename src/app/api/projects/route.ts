import { project } from '@/lib/mock-data';
import { ok } from '@/lib/api';

export async function GET() {
  return ok([project]);
}
