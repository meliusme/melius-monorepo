import { backendFetch } from 'src/lib/api/backend';
import { bffJson } from 'src/lib/api/bff';
import type { ApiRequestBody, ApiResponse } from 'src/lib/api/types';

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
