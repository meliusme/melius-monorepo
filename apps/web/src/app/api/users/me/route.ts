import { backendFetch } from '@lib/api/server/backend';
import { bffJson } from '@lib/api/server/bff';
import type { ApiResponse } from '@lib/api/types';

type MeResponse = ApiResponse<'/users/me', 'get'>;

export async function GET() {
  const res = backendFetch<MeResponse>({
    method: 'GET',
    path: '/users/me',
  });

  return bffJson(res);
}
