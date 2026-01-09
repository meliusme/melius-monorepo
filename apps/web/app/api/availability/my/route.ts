import { backendFetch } from 'src/lib/api/backend';
import { bffJson } from 'src/lib/api/bff';
import type { ApiResponse } from 'src/lib/api/types';
import { getOptionalQuery } from 'src/lib/api/route-utils';

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
