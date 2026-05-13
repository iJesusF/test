import { dependencies, tasks } from '@/lib/mock-data';
import { ok } from '@/lib/api';

export async function GET() {
  return ok({ tasks, dependencies });
}
