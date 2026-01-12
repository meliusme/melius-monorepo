import { Injectable, NotFoundException } from '@nestjs/common';
import { DocVerificationStatus } from '@prisma/client';
import { SearchMatchesDto } from './dto/search-matches.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private profilesService: ProfilesService,
  ) {}

  async getMatchedDocs(userId: number) {
    const userProblems = await this.prisma.userProfile.findUnique({
      where: { userId },
      include: {
        problems: true,
      },
    });

    if (!userProblems) {
      throw new NotFoundException('User not found');
    }

    const problemIds = userProblems.problems.map(({ id }) => id);

    const newProfiles = await this.profilesService.getNewDocsProfiles();

    const docProfiles = await this.prisma.docProfile.findMany({
      where: {
        verificationStatus: DocVerificationStatus.approved,
        specializations: {
          some: {
            matches: {
              some: {
                problemId: {
                  in: problemIds,
                },
              },
            },
          },
        },
      },
      include: {
        user: {
          include: {
            avatar: true,
          },
        },
      },
    });

    if (!docProfiles.length) {
      return newProfiles;
    }

    return docProfiles.map((docProfile) => ({
      ...docProfile.user,
      avatar: docProfile.user.avatar,
      docProfile,
    }));
  }

  async searchDocsWithSlots(dto: SearchMatchesDto) {
    const { problemId, from, to } = dto;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const docs = await this.prisma.docProfile.findMany({
      where: {
        verificationStatus: DocVerificationStatus.approved,
        specializations: {
          some: {
            matches: {
              some: {
                problemId,
              },
            },
          },
        },
        availabilitySlots: {
          some: {
            booked: false,
            startTime: { gte: fromDate },
            endTime: { lte: toDate },
          },
        },
      },
      include: {
        availabilitySlots: {
          where: {
            booked: false,
            startTime: { gte: fromDate },
            endTime: { lte: toDate },
          },
          orderBy: { startTime: 'asc' },
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
        user: {
          select: {
            id: true,
            language: true,
            avatar: {
              select: {
                id: true,
                key: true,
                url: true,
              },
            },
          },
        },
      },
      take: 100,
    });

    const mapped = docs.map((doc) => ({
      id: doc.id,
      firstName: doc.firstName,
      lastName: doc.lastName,
      profession: doc.profession,
      rate: doc.rate,
      ratesLot: doc.ratesLot,
      unitAmount: doc.unitAmount,
      currency: doc.currency,
      isApproved: doc.verificationStatus === DocVerificationStatus.approved,
      avatar: doc.user.avatar ? { url: doc.user.avatar.url } : null,
      language: doc.user.language,
      slots: doc.availabilitySlots,
      // helpful for sorting
      earliestSlotStart: doc.availabilitySlots?.[0]?.startTime ?? null,
    }));

    mapped.sort((a, b) => {
      // 1) earliest available slot
      const at = a.earliestSlotStart
        ? a.earliestSlotStart.getTime()
        : Number.POSITIVE_INFINITY;
      const bt = b.earliestSlotStart
        ? b.earliestSlotStart.getTime()
        : Number.POSITIVE_INFINITY;
      if (at !== bt) return at - bt;

      // 2) price
      if (a.unitAmount !== b.unitAmount) return a.unitAmount - b.unitAmount;

      // 3) stability
      return a.id - b.id;
    });

    let results = mapped.slice(0, 5);

    const missing = 5 - results.length;

    if (missing > 0) {
      const excludeIds = results.map((r) => r.id);

      const fallbackDocs = await this.prisma.docProfile.findMany({
        where: {
          verificationStatus: DocVerificationStatus.approved,
          id: { notIn: excludeIds },
          availabilitySlots: {
            some: {
              booked: false,
              startTime: { gte: fromDate },
              endTime: { lte: toDate },
            },
          },
        },
        orderBy: [{ reviewedAt: 'desc' }, { id: 'desc' }],
        take: missing,
        include: {
          availabilitySlots: {
            where: {
              booked: false,
              startTime: { gte: fromDate },
              endTime: { lte: toDate },
            },
            orderBy: { startTime: 'asc' },
            select: {
              id: true,
              startTime: true,
              endTime: true,
            },
          },
          user: {
            select: {
              id: true,
              language: true,
              avatar: {
                select: {
                  id: true,
                  key: true,
                  url: true,
                },
              },
            },
          },
        },
      });

      const fallbackMapped = fallbackDocs.map((doc) => ({
        id: doc.id,
        firstName: doc.firstName,
        lastName: doc.lastName,
        profession: doc.profession,
        rate: doc.rate,
        ratesLot: doc.ratesLot,
        unitAmount: doc.unitAmount,
        currency: doc.currency,
        isApproved: true,
        avatar: doc.user.avatar ? { url: doc.user.avatar.url } : null,
        language: doc.user.language,
        slots: doc.availabilitySlots,
        earliestSlotStart: doc.availabilitySlots?.[0]?.startTime ?? null,
      }));

      results = [...results, ...fallbackMapped];
    }

    return results.map(({ earliestSlotStart, ...rest }) => rest);
  }

  async getProblems() {
    return await this.prisma.problem.findMany();
  }
}
