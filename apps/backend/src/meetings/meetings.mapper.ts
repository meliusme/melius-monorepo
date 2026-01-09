import { Meeting } from '@prisma/client';
import { MeetingResponseDto } from './dtos/meeting-response.dto';

export const toMeetingResponse = (meeting: Meeting): MeetingResponseDto => ({
  id: meeting.id,
  startTime: meeting.startTime,
  endTime: meeting.endTime,
  status: meeting.status,
  clientMessage: meeting.clientMessage ?? null,
  createdAt: meeting.createdAt,
  updatedAt: meeting.updatedAt,
});
