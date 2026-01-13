import { backendFetch } from '@lib/api/server/backend';
import { bffJson } from '@lib/api/server/bff';
import type { ApiRequestBody, ApiResponse } from '@lib/api/types';

type SubmitDocProfileRequest = ApiRequestBody<'/profiles/doc/submit', 'post'>;
type SubmitDocProfileResponse = ApiResponse<'/profiles/doc/submit', 'post'>;

export async function POST(req: Request) {
  const body = (await req.json()) as SubmitDocProfileRequest;

  const res = backendFetch<SubmitDocProfileResponse>({
    method: 'POST',
    path: '/profiles/doc/submit',
    body,
  });

  return bffJson(res);
}
