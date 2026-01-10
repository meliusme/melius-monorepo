import { backendFetch } from 'src/lib/api/server/backend';
import { bffJson } from 'src/lib/api/server/bff';
import type { ApiRequestBody, ApiResponse } from 'src/lib/api/types';

type UserProfileResponse = ApiResponse<'/profiles/user', 'get'>;
type UpdateUserProfileRequest = ApiRequestBody<'/profiles/user', 'put'>;
type UpdateUserProfileResponse = ApiResponse<'/profiles/user', 'put'>;

export async function GET() {
  const res = backendFetch<UserProfileResponse>({
    method: 'GET',
    path: '/profiles/user',
  });

  return bffJson(res);
}

export async function PUT(req: Request) {
  const body = (await req.json()) as UpdateUserProfileRequest;

  const res = backendFetch<UpdateUserProfileResponse>({
    method: 'PUT',
    path: '/profiles/user',
    body,
  });

  return bffJson(res);
}
