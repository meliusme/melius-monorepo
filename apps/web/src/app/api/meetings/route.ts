import { backendFetch } from 'src/lib/api/server/backend';
import { bffJson } from 'src/lib/api/server/bff';
import type { ApiRequestBody, ApiResponse } from 'src/lib/api/types';

type CreateMeetingRequest = ApiRequestBody<'/meetings', 'post'>;
type CreateMeetingResponse = ApiResponse<'/meetings', 'post'>;

export async function POST(req: Request) {
  const body = (await req.json()) as CreateMeetingRequest;

  const res = backendFetch<CreateMeetingResponse>({
    method: 'POST',
    path: '/meetings',
    body,
  });

  return bffJson(res);
}
