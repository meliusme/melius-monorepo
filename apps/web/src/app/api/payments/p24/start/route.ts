import { backendFetch } from 'src/lib/api/server/backend';
import { bffJson } from 'src/lib/api/server/bff';
import type { ApiRequestBody, ApiResponse } from 'src/lib/api/types';

type P24StartRequest = ApiRequestBody<'/payments/p24/start', 'post'>;
type P24StartResponse = ApiResponse<'/payments/p24/start', 'post'>;

export async function POST(req: Request) {
  const body = (await req.json()) as P24StartRequest;

  const res = backendFetch<P24StartResponse>({
    method: 'POST',
    path: '/payments/p24/start',
    body,
  });

  return bffJson(res);
}
