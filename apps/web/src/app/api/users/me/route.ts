import { backendFetch } from 'src/lib/api/server/backend';
import { bffJson } from 'src/lib/api/server/bff';
import type { ApiResponse } from 'src/lib/api/types';

type MeResponse = ApiResponse<'/users/me', 'get'>;

export async function GET() {
  const res = backendFetch<MeResponse>({
    method: 'GET',
    path: '/users/me',
  });

  return bffJson(res);
}
