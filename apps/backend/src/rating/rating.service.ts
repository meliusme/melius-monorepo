import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocRateDto } from './dto/create-doc-rate.dto';
import { User, MeetingStatus } from '@prisma/client';
@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  async addDocRate(user: User, createDocRateDto: CreateDocRateDto) {
    const { docId, meetingId, rate } = createDocRateDto;

    // 1) Check if the doc profile exists
    const docProfile = await this.prisma.docProfile.findUnique({
      where: { id: docId },
    });

    if (!docProfile) {
      throw new BadRequestException('Therapist profile not found');
    }

    // 2) Check if the user profile exists
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    if (!userProfile) {
      throw new BadRequestException('User profile not found');
    }

    // 3) Check if the meeting exists
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new BadRequestException('Meeting not found');
    }

    // 4) Check if the meeting belongs to this user
    if (meeting.userId !== user.id) {
      throw new BadRequestException(
        'You can only rate sessions that belong to you',
      );
    }

    // 5) Check if the meeting is with the selected therapist
    if (meeting.docId !== docProfile.id) {
      throw new BadRequestException(
        'You can only rate sessions with the selected therapist',
      );
    }

    if (meeting.status !== MeetingStatus.completed) {
      throw new BadRequestException('You can only rate completed sessions');
    }

    // 7) Check if there is already a rating for this meeting from this user
    const existingRating = await this.prisma.rating.findFirst({
      where: {
        meetingId,
        userId: userProfile.id,
      },
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this session');
    }

    // 8) create the rating
    await this.prisma.rating.create({
      data: {
        rate,
        docId: docProfile.id,
        userId: userProfile.id,
        meetingId,
      },
    });

    // 9) Recalculate the average and count of the therapist's ratings
    const avgAndCount = await this.prisma.rating.aggregate({
      where: {
        docId: docProfile.id,
      },
      _count: {
        rate: true,
      },
      _avg: {
        rate: true,
      },
    });

    // 10) Update the therapist's profile
    const updatedDocProfile = await this.prisma.docProfile.update({
      where: {
        id: docProfile.id,
      },
      data: {
        rate: avgAndCount._avg.rate,
        ratesLot: avgAndCount._count.rate,
      },
    });

    return updatedDocProfile;
  }

  async getDocRatings(docId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.rating.findMany({
        where: { docId },
        include: {
          user: true, // UserProfile (contains firstName/lastName)
        },
        orderBy: {
          createdAt: 'desc',
        },
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
