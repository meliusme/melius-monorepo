import { backendFetch } from 'src/lib/api/backend';
import { bffJson } from 'src/lib/api/bff';
import type { ApiResponse } from 'src/lib/api/types';
import { getOptionalQuery } from 'src/lib/api/route-utils';

type MyMeetingsResponse = ApiResponse<'/meetings/me', 'get'>;

export async function GET(req: Request) {
  const query = getOptionalQuery(req);

  const res = backendFetch<MyMeetingsResponse>({
    method: 'GET',
    path: '/meetings/me',
    query,
  });

  return bffJson(res);
}
