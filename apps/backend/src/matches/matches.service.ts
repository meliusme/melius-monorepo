import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getProblems() {
    return await this.prisma.problem.findMany();
  }
}
