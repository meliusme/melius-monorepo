import { NextResponse } from 'next/server';

type ErrorShape = {
  statusCode?: number;
  message?: string;
  error?: string;
  code?: string;
};

export async function bffJson<T>(promise: Promise<T>) {
  try {
    const data = await promise;
    return NextResponse.json(data);
  } catch (err) {
    const payload = err as ErrorShape | undefined;
    const status =
      typeof payload?.statusCode === 'number'
        ? payload.statusCode
        : typeof (payload as { status?: number } | undefined)?.status === 'number'
        ? (payload as { status: number }).status
        : 500;

    return NextResponse.json(payload ?? { statusCode: status, message: 'Request failed' }, {
      status,
    });
  }
}
