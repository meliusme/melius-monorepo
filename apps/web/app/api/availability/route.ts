import { backendFetch } from 'src/lib/api/backend';
import { bffJson } from 'src/lib/api/bff';
import type { ApiRequestBody, ApiResponse } from 'src/lib/api/types';

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
