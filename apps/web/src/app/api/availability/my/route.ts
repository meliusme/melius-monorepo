import { backendFetch } from '@lib/api/server/backend';
import { bffJson } from '@lib/api/server/bff';
import type { ApiResponse } from '@lib/api/types';
import { getOptionalQuery } from '@lib/api/server/route-utils';

type MyAvailabilityResponse = ApiResponse<'/availability/my', 'get'>;

export async function GET(req: Request) {
  const query = getOptionalQuery(req);

  const res = backendFetch<MyAvailabilityResponse>({
    method: 'GET',
    path: '/availability/my',
    query,
  });

  return bffJson(res);
}
