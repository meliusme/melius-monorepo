import { backendFetch } from '@lib/api/server/backend';
import { bffJson } from '@lib/api/server/bff';
import type { ApiResponse } from '@lib/api/types';
import { getOptionalQuery } from '@lib/api/server/route-utils';

type DocAvailabilityResponse = ApiResponse<'/availability/doc/{docId}', 'get'>;

export async function GET(req: Request, { params }: { params: { docId: string } }) {
  const query = getOptionalQuery(req);

  const res = backendFetch<DocAvailabilityResponse>({
    method: 'GET',
    path: `/availability/doc/${params.docId}`,
    query,
  });

  return bffJson(res);
}
