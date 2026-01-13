import { backendFetch } from '@lib/api/server/backend';
import { bffJson } from '@lib/api/server/bff';
import type { ApiRequestBody } from '@lib/api/types';

type RemoveAvailabilityResponse = ApiResponse<'/availability/{slotId}', 'delete'>;

export async function DELETE(_req: Request, { params }: { params: { slotId: string } }) {
  const res = backendFetch<RemoveAvailabilityResponse>({
    method: 'DELETE',
    path: `/availability/${params.slotId}`,
  });

  return bffJson(res);
}
