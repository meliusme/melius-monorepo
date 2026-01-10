import { backendFetch } from 'src/lib/api/server/backend';
import { bffJson } from 'src/lib/api/server/bff';
import type { ApiResponse } from 'src/lib/api/types';

type ProblemsResponse = ApiResponse<'/matches/problems', 'get'>;

export async function GET() {
  const res = backendFetch<ProblemsResponse>({
    method: 'GET',
    path: '/matches/problems',
    auth: false,
  });

  return bffJson(res);
}
