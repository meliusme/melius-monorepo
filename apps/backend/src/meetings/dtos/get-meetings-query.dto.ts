import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum MeetingScopeEnum {
  UPCOMING = 'upcoming',
  PAST = 'past',
  ALL = 'all',
}

export class GetMeetingsQueryDto {
  @IsOptional()
  @IsEnum(MeetingScopeEnum)
  @ApiPropertyOptional({
    enum: MeetingScopeEnum,
    enumName: 'MeetingScopeEnum',
    default: MeetingScopeEnum.UPCOMING,
  })
  scope?: MeetingScopeEnum = MeetingScopeEnum.UPCOMING;
}
