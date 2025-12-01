import { IsEnum, IsOptional } from 'class-validator';

export enum MeetingScopeEnum {
  UPCOMING = 'upcoming',
  PAST = 'past',
  ALL = 'all',
}

export class GetMeetingsQueryDto {
  @IsOptional()
  @IsEnum(MeetingScopeEnum)
  scope?: MeetingScopeEnum = MeetingScopeEnum.UPCOMING;
}
