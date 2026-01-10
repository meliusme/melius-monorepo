import { backendFetch } from 'src/lib/api/server/backend';
import { bffJson } from 'src/lib/api/server/bff';
import type { ApiResponse } from 'src/lib/api/types';
import { getOptionalQuery } from 'src/lib/api/server/route-utils';

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
