import { backendFetch } from '@lib/api/server/backend';
import { bffJson } from '@lib/api/server/bff';
import type { ApiRequestBody, ApiResponse } from '@lib/api/types';

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
