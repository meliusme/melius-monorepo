import { getErrorMessage } from '@lib/errors';

/**
 * Safe wrapper for fetch operations with error handling
 * Always returns { data, error } instead of throwing an exception
 */
export async function safeFetch<T>(
  fetcher: () => Promise<T>,
  tErrors: (key: string) => string,
  fallback: T,
): Promise<{ data: T; error: string | null }> {
  try {
    const data = await fetcher();
    return { data, error: null };
  } catch (err) {
    return { data: fallback, error: getErrorMessage(err, tErrors) };
  }
}
