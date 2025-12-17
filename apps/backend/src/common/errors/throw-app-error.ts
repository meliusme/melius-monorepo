import { HttpStatus } from '@nestjs/common';
import { AppException } from './app-exception';
import { ErrorCode } from './error-codes';

export const throwAppError = (
  code: ErrorCode,
  status: HttpStatus,
  message: string,
): never => {
  throw new AppException(code, message, status);
};
