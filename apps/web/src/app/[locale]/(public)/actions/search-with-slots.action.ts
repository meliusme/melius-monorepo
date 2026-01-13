'use server';

import { backendFetch } from '@lib/api/server/backend';
import type { ApiRequestBody, ApiResponse } from '@lib/api/types';
import { safeFetch } from '@lib/api/server/safe-fetch';
import { getTranslations } from 'next-intl/server';

type SearchMatchesRequest = ApiRequestBody<'/matches/search-with-slots', 'post'>;
type SearchMatchesResponse = ApiResponse<'/matches/search-with-slots', 'post'>;

export async function searchWithSlotsAction(data: SearchMatchesRequest) {
  const tErrors = await getTranslations('Errors');

  return safeFetch(
    () =>
      backendFetch<SearchMatchesResponse>({
        method: 'POST',
        path: '/matches/search-with-slots',
        body: data,
        auth: false,
      }),
    tErrors,
    [],
  );
}
