import { backendFetch } from 'src/lib/api/server/backend';
import { bffJson } from 'src/lib/api/server/bff';
import type { ApiRequestBody, ApiResponse } from 'src/lib/api/types';

type DocProfileResponse = ApiResponse<'/profiles/doc', 'get'>;
type UpdateDocProfileRequest = ApiRequestBody<'/profiles/doc', 'put'>;
type UpdateDocProfileResponse = ApiResponse<'/profiles/doc', 'put'>;

export async function GET() {
  const res = backendFetch<DocProfileResponse>({
    method: 'GET',
    path: '/profiles/doc',
  });

  return bffJson(res);
}

export async function PUT(req: Request) {
  const body = (await req.json()) as UpdateDocProfileRequest;

  const res = backendFetch<UpdateDocProfileResponse>({
    method: 'PUT',
    path: '/profiles/doc',
    body,
  });

  return bffJson(res);
}
