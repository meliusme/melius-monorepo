import { backendFetch } from '@lib/api/server/backend';
import { bffJson } from '@lib/api/server/bff';
import type { ApiResponse } from '@lib/api/types';
import { getOptionalQuery } from '@lib/api/server/route-utils';

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
