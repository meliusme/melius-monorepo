import { backendFetch } from 'src/lib/api/backend';
import { bffJson } from 'src/lib/api/bff';
import type { ApiResponse } from 'src/lib/api/types';
import { getOptionalQuery } from 'src/lib/api/route-utils';

type DocRatingsResponse = ApiResponse<'/profiles/doc/{docId}/ratings', 'get'>;

export async function GET(req: Request, { params }: { params: { docId: string } }) {
  const query = getOptionalQuery(req);

  const res = backendFetch<DocRatingsResponse>({
    method: 'GET',
    path: `/profiles/doc/${params.docId}/ratings`,
    query,
  });

  return bffJson(res);
}
