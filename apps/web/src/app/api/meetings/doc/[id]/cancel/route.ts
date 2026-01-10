import { backendFetch } from 'src/lib/api/server/backend';
import { bffJson } from 'src/lib/api/server/bff';
import type { ApiResponse } from 'src/lib/api/types';

type CancelDocMeetingResponse = ApiResponse<'/meetings/doc/{id}/cancel', 'post'>;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const res = backendFetch<CancelDocMeetingResponse>({
    method: 'POST',
    path: `/meetings/doc/${params.id}/cancel`,
  });

  return bffJson(res);
}
