import { backendFetch } from 'src/lib/api/server/backend';
import { bffJson } from 'src/lib/api/server/bff';
import type { ApiResponse } from 'src/lib/api/types';

type CancelMeetingResponse = ApiResponse<'/meetings/{id}/cancel', 'post'>;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const res = backendFetch<CancelMeetingResponse>({
    method: 'POST',
    path: `/meetings/${params.id}/cancel`,
  });

  return bffJson(res);
}
