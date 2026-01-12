import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

function IsValidDateRange(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidDateRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const object = args.object as any;
          const from = new Date(object.from);
          const to = new Date(object.to);
          const now = new Date();

          if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            return false;
          }

          // 1. from must be in the future (with 1-minute grace period)
          const graceMs = 60_000; // 1 minute
          if (from.getTime() < now.getTime() - graceMs) {
            return false;
          }

          // 2. from <= to
          if (from > to) {
            return false;
          }

          // 3. max 30 days range
          const diffMs = to.getTime() - from.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);

          return diffDays <= 30;
        },
        defaultMessage(args: ValidationArguments) {
          const object = args.object as any;
          const from = new Date(object.from);
          const to = new Date(object.to);
          const now = new Date();

          if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            return 'Invalid date format';
          }

          const graceMs = 60_000; // 1 minute
          if (from.getTime() < now.getTime() - graceMs) {
            return 'Date range invalid: "from" cannot be in the past';
          }

          if (from > to) {
            return 'Date range invalid: "from" must be before or equal to "to"';
          }

          return 'Date range too wide: maximum allowed is 30 days';
        },
      },
    });
  };
}

export class SearchMatchesDto {
  @ApiProperty({ type: 'integer' })
  @IsInt()
  problemId: number;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  from: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  @IsValidDateRange()
  to: string;
}
