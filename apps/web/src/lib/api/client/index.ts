import createClient from 'openapi-fetch';
import type { paths } from 'src/generated/openapi';

export const apiClient = createClient<paths>({
  baseUrl:
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3000',
  credentials: 'include',
});
