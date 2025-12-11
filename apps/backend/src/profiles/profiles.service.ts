import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';
import { UpdateDocProfileDto } from './dtos/update-doc-profile.dto';
import { UpdateAdminProfileDto } from './dtos/update-admin-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async updateUserProfile(
    userId: number,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const existingIds = await this.prisma.problem.findMany({
      where: {
        id: {
          in: updateUserProfileDto.problems,
        },
      },
    });

    if (existingIds.length !== updateUserProfileDto.problems.length) {
      throw new NotFoundException('One or more IDs provided do not exist');
    }

    return await this.prisma.userProfile.update({
      where: { userId },
      data: {
        ...updateUserProfileDto,
        problems: {
          set: updateUserProfileDto.problems.map((id) => ({ id })),
        },
        published: true,
      },
    });
  }

  async updateDocProfile(
    docId: number,
    updateDocProfileDto: UpdateDocProfileDto,
  ) {
    const existingIds = await this.prisma.specialization.findMany({
      where: {
        id: {
          in: updateDocProfileDto.specializations,
        },
      },
    });
    if (existingIds.length !== updateDocProfileDto.specializations.length) {
      throw new NotFoundException('One or more IDs provided do not exist');
    }

    return await this.prisma.docProfile.update({
      where: { docId },
      data: {
        ...updateDocProfileDto,
        specializations: {
          set: updateDocProfileDto.specializations.map((id) => ({ id })),
        },
      },
    });
  }

  async updateAdminProfile(
    userId: number,
    updateAdminProfileDto: UpdateAdminProfileDto,
  ) {
    return await this.prisma.adminProfile.update({
      where: { userId },
      data: updateAdminProfileDto,
    });
  }

  async getUserProfile(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        avatar: true,
        userProfile: {
          include: {
            problems: true,
          },
        },
      },
    });
  }

  async getDocProfile(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        avatar: true,
        docProfile: {
          include: {
            specializations: true,
          },
        },
      },
    });
  }

  async getNewDocsProfiles() {
    return await this.prisma.user.findMany({
      where: {
        role: 'doc',
        docProfile: {
          published: true,
        },
      },
      include: {
        docProfile: true,
        avatar: true,
      },
      take: 3,
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getBestDocsProfiles() {
    return await this.prisma.user.findMany({
      where: {
        role: 'doc',
        docProfile: {
          published: true,
        },
      },
      include: {
        docProfile: true,
        avatar: true,
      },
      take: 3,
      orderBy: {
        docProfile: {
          rate: 'desc',
          ratesLot: 'desc',
        },
      },
    });
  }
}
