'use server';

import { backendFetch } from '@lib/api/server/backend';
import type { ApiRequestBody, ApiResponse } from '@lib/api/types';
import { safeFetch } from '@lib/api/server/safe-fetch';
import { getTranslations } from 'next-intl/server';

type RegisterLightRequest = ApiRequestBody<'/auth/register-light', 'post'>;
type RegisterLightResponse = ApiResponse<'/auth/register-light', 'post'>;

export async function registerLightAction(data: RegisterLightRequest) {
  const tErrors = await getTranslations('Errors');

  // Validate consents
  if (!data.consentTerms || !data.consentAdult || !data.consentHealthData) {
    return {
      data: null,
      error: tErrors('CONSENT_REQUIRED'),
    };
  }

  return safeFetch(
    () =>
      backendFetch<RegisterLightResponse>({
        method: 'POST',
        path: '/auth/register-light',
        body: data,
        auth: false,
      }),
    tErrors,
    null,
  );
}
