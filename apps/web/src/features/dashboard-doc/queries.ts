'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@lib/api/types';

type DocMeetingsResponse = ApiResponse<'/meetings/doc', 'get'>;

export function useDocMeetings(scope: string) {
  return useQuery({
    queryKey: ['docMeetings', scope],
    queryFn: async (): Promise<DocMeetingsResponse> => {
      const res = await fetch(`/api/meetings/doc?scope=${encodeURIComponent(scope)}`, {
        credentials: 'include',
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
  });
}
