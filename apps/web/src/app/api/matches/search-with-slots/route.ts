import { backendFetch } from 'src/lib/api/server/backend';
import { bffJson } from 'src/lib/api/server/bff';
import type { ApiRequestBody, ApiResponse } from 'src/lib/api/types';

type SearchRequest = ApiRequestBody<'/matches/search-with-slots', 'post'>;
type SearchResponse = ApiResponse<'/matches/search-with-slots', 'post'>;

export async function POST(req: Request) {
  const body = (await req.json()) as SearchRequest;

  const res = backendFetch<SearchResponse>({
    method: 'POST',
    path: '/matches/search-with-slots',
    body,
    auth: false,
  });

  return bffJson(res);
}
