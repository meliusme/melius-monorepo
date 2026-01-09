import { backendFetch } from 'src/lib/api/backend';
import { bffJson } from 'src/lib/api/bff';
import type { ApiResponse } from 'src/lib/api/types';
import { getOptionalQuery } from 'src/lib/api/route-utils';

type DocMeetingsResponse = ApiResponse<'/meetings/doc', 'get'>;

export async function GET(req: Request) {
  const query = getOptionalQuery(req);

  const res = backendFetch<DocMeetingsResponse>({
    method: 'GET',
    path: '/meetings/doc',
    query,
  });

  return bffJson(res);
}
