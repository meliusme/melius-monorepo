import { backendFetch } from 'src/lib/api/backend';
import { bffJson } from 'src/lib/api/bff';
import type { ApiRequestBody, ApiResponse } from 'src/lib/api/types';

type AddRateRequest = ApiRequestBody<'/profiles/rate', 'post'>;
type AddRateResponse = ApiResponse<'/profiles/rate', 'post'>;

export async function POST(req: Request) {
  const body = (await req.json()) as AddRateRequest;

  const res = backendFetch<AddRateResponse>({
    method: 'POST',
    path: '/profiles/rate',
    body,
  });

  return bffJson(res);
}
