import { NextResponse } from 'next/server';
import type { ApiErrorShape } from 'src/lib/errors';
import { extractErrorCode } from 'src/lib/errors';

export async function bffJson<T>(promise: Promise<T>) {
  try {
    const data = await promise;
    return NextResponse.json(data);
  } catch (err) {
    const payload = err as ApiErrorShape | undefined;
    const status =
      typeof payload?.statusCode === 'number'
        ? payload.statusCode
        : typeof payload?.status === 'number'
          ? payload.status
          : 500;
    const code = extractErrorCode(payload);

    return NextResponse.json(
      {
        ...payload,
        statusCode: status,
        code,
        message: payload?.message ?? 'Request failed',
      },
      {
        status,
      },
    );
  }
}
