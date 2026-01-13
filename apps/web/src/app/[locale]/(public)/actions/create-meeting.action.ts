'use server';

import { backendFetch } from '@lib/api/server/backend';
import type { ApiRequestBody, ApiResponse } from '@lib/api/types';
import { safeFetch } from '@lib/api/server/safe-fetch';
import { getTranslations } from 'next-intl/server';

type CreateMeetingRequest = ApiRequestBody<'/meetings', 'post'>;
type CreateMeetingResponse = ApiResponse<'/meetings', 'post'>;

export async function createMeetingAction(data: CreateMeetingRequest) {
  const tErrors = await getTranslations('Errors');

  return safeFetch(
    () =>
      backendFetch<CreateMeetingResponse>({
        method: 'POST',
        path: '/meetings',
        body: data,
        auth: true, // Requires authentication
      }),
    tErrors,
    null,
  );
}
