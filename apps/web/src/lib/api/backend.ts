import { cookies, headers } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL!;

export const dynamic = 'force-dynamic';

type FetchOpts = {
  method?: string;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  auth?: boolean;
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
  forwardHeaders?: boolean;
};

function isJsonResponse(res: Response) {
  return res.headers.get('content-type')?.includes('application/json');
}

function isBodyInit(body: unknown): body is BodyInit {
  return (
    typeof body === 'string' ||
    body instanceof ArrayBuffer ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ReadableStream
  );
}

export async function backendFetch<T>({
  method = 'GET',
  path,
  query,
  body,
  auth = true,
  cache = 'no-store',
  revalidate,
  tags,
  forwardHeaders = true,
}: FetchOpts): Promise<T> {
  const url = new URL(path, BACKEND_URL);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  const h = new Headers();
  const hasBody =
    body !== undefined &&
    body !== null &&
    method !== 'GET' &&
    method !== 'HEAD';
  const rawBody = hasBody
    ? isBodyInit(body)
      ? body
      : JSON.stringify(body)
    : undefined;

  if (hasBody && !isBodyInit(body)) {
    h.set('Content-Type', 'application/json');
  }

  if (auth) {
    const cookieHeader = (await cookies()).toString();
    if (cookieHeader) h.set('cookie', cookieHeader);
  }

  if (forwardHeaders) {
    const incomingHeaders = await headers();
    const ua = incomingHeaders.get('user-agent');
    if (ua) h.set('user-agent', ua);
    const forwardedFor = incomingHeaders.get('x-forwarded-for');
    if (forwardedFor) h.set('x-forwarded-for', forwardedFor);
  }

  const res = await fetch(url.toString(), {
    method,
    headers: h,
    body: rawBody,
    cache,
    next: revalidate !== undefined || tags ? { revalidate, tags } : undefined,
  });

  if (res.status === 204) return null as T;

  const data = isJsonResponse(res)
    ? await res.json().catch(() => null)
    : await res.text();

  if (!res.ok) {
    throw data ?? { statusCode: res.status, message: 'Request failed' };
  }

  return data as T;
}
