import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocRateDto } from './dto/create-doc-rate.dto';
import { User, MeetingStatus } from '@prisma/client';
import { throwAppError } from '../common/errors/throw-app-error';
import { ErrorCode } from '../common/errors/error-codes';
@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  async addDocRate(user: User, createDocRateDto: CreateDocRateDto) {
    const { docId, meetingId, rate, comment } = createDocRateDto;

    // 1) Check if the doc profile exists
    const docProfile = await this.prisma.docProfile.findUnique({
      where: { id: docId },
    });

    if (!docProfile) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Therapist profile not found',
      );
    }

    // 2) Check if the user profile exists
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    if (!userProfile) {
      throwAppError(
        ErrorCode.USER_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'User profile not found',
      );
    }

    // 3) Check if the meeting exists
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throwAppError(
        ErrorCode.MEETING_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Meeting not found',
      );
    }

    // 4) Check if the meeting belongs to this user
    if (meeting.userId !== user.id) {
      throwAppError(
        ErrorCode.MEETING_NOT_OWNED,
        HttpStatus.FORBIDDEN,
        'You can only rate sessions that belong to you',
      );
    }

    // 5) Check if the meeting is with the selected therapist
    if (meeting.docId !== docProfile.id) {
      throwAppError(
        ErrorCode.RATING_MEETING_MISMATCH,
        HttpStatus.BAD_REQUEST,
        'You can only rate sessions with the selected therapist',
      );
    }
    // 6) Check if the meeting is completed
    if (meeting.status !== MeetingStatus.completed) {
      throwAppError(
        ErrorCode.RATING_MEETING_NOT_COMPLETED,
        HttpStatus.BAD_REQUEST,
        'You can only rate completed sessions',
      );
    }

    // 7) Check if there is already a rating for this meeting from this user
    return this.prisma.$transaction(async (tx) => {
      // 7) existing rating check
      const existingRating = await tx.rating.findFirst({
        where: { meetingId, userId: userProfile.id },
      });
      if (existingRating)
        throwAppError(
          ErrorCode.RATING_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
          'You have already rated this session',
        );

      // 8) create rating
      await tx.rating.create({
        data: {
          rate,
          comment,
          docId: docProfile.id,
          userId: userProfile.id,
          meetingId,
        },
      });

      // 9) aggregate
      const avgAndCount = await tx.rating.aggregate({
        where: { docId: docProfile.id },
        _count: { rate: true },
        _avg: { rate: true },
      });

      // 10) update doc profile
      const updatedDocProfile = await tx.docProfile.update({
        where: { id: docProfile.id },
        data: {
          rate: avgAndCount._avg.rate,
          ratesLot: avgAndCount._count.rate,
        },
        include: {
          specializations: true,
        },
      });

      return updatedDocProfile;
    });
  }

  async getDocRatings(docId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.rating.findMany({
        where: { docId },
        select: {
          id: true,
          rate: true,
          comment: true,
          createdAt: true,
          userId: true,
          user: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.rating.count({
        where: { docId },
      }),
    ]);

    return {
      items: items.map((r) => ({
        id: r.id,
        rate: r.rate,
        comment: r.comment,
        createdAt: r.createdAt,
        user: {
          id: r.userId,
          firstName: r.user.firstName,
          lastName: r.user.lastName,
        },
      })),
      total,
      page,
      limit,
    };
  }
}
