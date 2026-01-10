import { backendFetch } from 'src/lib/api/server/backend';
import { bffJson } from 'src/lib/api/server/bff';
import type { ApiRequestBody, ApiResponse } from 'src/lib/api/types';

type CheckoutRequest = ApiRequestBody<'/payments/checkout', 'post'>;
type CheckoutResponse = ApiResponse<'/payments/checkout', 'post'>;

export async function POST(req: Request) {
  const body = (await req.json()) as CheckoutRequest;

  const res = backendFetch<CheckoutResponse>({
    method: 'POST',
    path: '/payments/checkout',
    body,
  });

  return bffJson(res);
}
