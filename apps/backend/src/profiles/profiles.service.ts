import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { DocVerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';
import { UpdateDocProfileDto } from './dtos/update-doc-profile.dto';
import { UpdateAdminProfileDto } from './dtos/update-admin-profile.dto';
import { throwAppError } from 'src/common/errors/throw-app-error';
import { ErrorCode } from 'src/common/errors/error-codes';
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
    const current = await this.prisma.docProfile.findUnique({
      where: { docId },
      select: { id: true, verificationStatus: true },
    });

    if (!current) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Doc profile not found',
      );
    }

    if (
      current.verificationStatus === DocVerificationStatus.submitted ||
      current.verificationStatus === DocVerificationStatus.rejected
    ) {
      await this.prisma.docProfile.update({
        where: { id: current.id },
        data: {
          verificationStatus: DocVerificationStatus.draft,
          submittedAt: null,
          reviewedAt: null,
          rejectionReason: null,
        },
      });
    }

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
      where: { id: current.id },
      data: {
        ...updateDocProfileDto,
        specializations: {
          set: updateDocProfileDto.specializations.map((id) => ({ id })),
        },
      },
    });
  }

  async submitDocProfile(userId: number) {
    const doc = await this.prisma.docProfile.findUnique({
      where: { docId: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profession: true,
        sessionPricePln: true,
        verificationStatus: true,
        docTermsAccepted: true,
        specializations: { select: { id: true } },
      },
    });

    if (!doc) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Doc profile not found',
      );
    }

    // Do not allow submitting an approved profile.
    if (doc.verificationStatus === DocVerificationStatus.approved) {
      throwAppError(
        ErrorCode.DOC_PROFILE_ALREADY_APPROVED,
        HttpStatus.CONFLICT,
        'Profile already approved',
      );
    }

    // If already submitted, return current state (idempotent).
    if (doc.verificationStatus === DocVerificationStatus.submitted) {
      return this.prisma.docProfile.findUnique({
        where: { id: doc.id },
        include: { specializations: true },
      });
    }

    // Completeness validation (MVP).
    const missing: string[] = [];
    if (!doc.firstName) missing.push('firstName');
    if (!doc.lastName) missing.push('lastName');
    if (!doc.profession) missing.push('profession');
    if (!doc.sessionPricePln) missing.push('sessionPricePln');
    if (!doc.specializations?.length) missing.push('specializations');
    if (!doc.docTermsAccepted) missing.push('docTermsAccepted');

    if (missing.length) {
      throwAppError(
        ErrorCode.DOC_PROFILE_INCOMPLETE,
        HttpStatus.UNPROCESSABLE_ENTITY,
        `Profile incomplete. Missing: ${missing.join(', ')}`,
      );
    }

    return this.prisma.docProfile.update({
      where: { id: doc.id },
      data: {
        verificationStatus: DocVerificationStatus.submitted,
        submittedAt: new Date(),
        rejectionReason: null,
      },
      include: { specializations: true },
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
          verificationStatus: DocVerificationStatus.approved,
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
          verificationStatus: DocVerificationStatus.approved,
        },
      },
      include: {
        docProfile: true,
        avatar: true,
      },
      take: 3,
      orderBy: [
        {
          docProfile: {
            rate: 'desc',
          },
        },
        {
          docProfile: {
            ratesLot: 'desc',
          },
        },
      ],
    });
  }
}
