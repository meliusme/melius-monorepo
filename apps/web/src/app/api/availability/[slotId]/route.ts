import { backendFetch } from 'src/lib/api/server/backend';
import { bffJson } from 'src/lib/api/server/bff';
import type { ApiResponse } from 'src/lib/api/types';

type RemoveAvailabilityResponse = ApiResponse<'/availability/{slotId}', 'delete'>;

export async function DELETE(_req: Request, { params }: { params: { slotId: string } }) {
  const res = backendFetch<RemoveAvailabilityResponse>({
    method: 'DELETE',
    path: `/availability/${params.slotId}`,
  });

  return bffJson(res);
}
