import { ErrorCode } from 'src/generated/error-codes.generated';

export type ApiErrorShape = {
  code?: string;
  error?: string;
  message?: string;
  statusCode?: number;
  status?: number;
};

const errorCodes = new Set(Object.values(ErrorCode));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function extractErrorCode(err: unknown): ErrorCode | undefined {
  if (!isRecord(err)) return undefined;
  const code = err.code;
  if (typeof code === 'string' && errorCodes.has(code as ErrorCode)) {
    return code as ErrorCode;
  }
  const error = err.error;
  if (typeof error === 'string' && errorCodes.has(error as ErrorCode)) {
    return error as ErrorCode;
  }
  return undefined;
}

export function getErrorMessage(
  err: unknown,
  tErrors: (key: ErrorCode | string) => string,
  fallbackKey: ErrorCode | string = ErrorCode.INVALID_REQUEST,
) {
  const code = extractErrorCode(err);
  if (code) return tErrors(code);

  if (isRecord(err)) {
    const message = err.message;
    if (typeof message === 'string' && message.length > 0) return message;
  }

  return tErrors(fallbackKey);
}
