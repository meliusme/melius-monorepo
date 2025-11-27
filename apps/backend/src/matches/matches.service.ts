import { Injectable, NotFoundException } from '@nestjs/common';
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
        published: true,
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
    });

    if (!docProfiles.length) {
      return newProfiles;
    }

    return docProfiles;
  }

  async searchDocsWithSlots(dto: SearchMatchesDto) {
    const { problemId, from, to } = dto;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const docs = await this.prisma.docProfile.findMany({
      where: {
        published: true,
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
        },
        user: {
          select: {
            id: true,
            email: true,
            language: true,
          },
        },
      },
    });

    return docs.map((doc) => ({
      id: doc.id,
      firstName: doc.firstName,
      lastName: doc.lastName,
      profession: doc.profession,
      rate: doc.rate,
      published: doc.published,
      user: {
        id: doc.user.id,
        email: doc.user.email,
        language: doc.user.language,
      },
      slots: doc.availabilitySlots,
    }));
  }

  async getProblems() {
    return await this.prisma.problem.findMany();
  }
}
