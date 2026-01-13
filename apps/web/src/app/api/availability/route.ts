import { backendFetch } from '@lib/api/server/backend';
import { bffJson } from '@lib/api/server/bff';
import type { ApiRequestBody, ApiResponse } from '@lib/api/types';

type CreateAvailabilityRequest = ApiRequestBody<'/availability', 'post'>;
type CreateAvailabilityResponse = ApiResponse<'/availability', 'post'>;

export async function POST(req: Request) {
  const body = (await req.json()) as CreateAvailabilityRequest;

  const res = backendFetch<CreateAvailabilityResponse>({
    method: 'POST',
    path: '/availability',
    body,
  });

  return bffJson(res);
}
