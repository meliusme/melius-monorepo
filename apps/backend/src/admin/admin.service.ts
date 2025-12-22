import { HttpStatus, Injectable } from '@nestjs/common';
import { DocVerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { throwAppError } from '../common/errors/throw-app-error';
import { ErrorCode } from '../common/errors/error-codes';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async approveDocProfile(docProfileId: number) {
    const doc = await this.prisma.docProfile.findUnique({
      where: { id: docProfileId },
      select: { id: true, verificationStatus: true },
    });

    if (!doc) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Doc profile not found',
      );
    }

    // opcjonalnie: wymagaj, żeby był submitted
    if (doc.verificationStatus === DocVerificationStatus.draft) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_SUBMITTED,
        HttpStatus.CONFLICT,
        'Profile is not submitted for review',
      );
    }

    if (doc.verificationStatus === DocVerificationStatus.approved) {
      return this.prisma.docProfile.findUnique({
        where: { id: doc.id },
        include: { specializations: true },
      });
    }

    return this.prisma.docProfile.update({
      where: { id: doc.id },
      data: {
        verificationStatus: DocVerificationStatus.approved,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
      include: { specializations: true },
    });
  }

  async rejectDocProfile(docProfileId: number, reason: string) {
    if (!reason || reason.trim().length < 3) {
      throwAppError(
        ErrorCode.INVALID_REJECTION_REASON,
        HttpStatus.BAD_REQUEST,
        'Rejection reason is required',
      );
    }

    const doc = await this.prisma.docProfile.findUnique({
      where: { id: docProfileId },
      select: { id: true, verificationStatus: true },
    });

    if (!doc) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Doc profile not found',
      );
    }

    // opcjonalnie: wymagaj submitted
    if (doc.verificationStatus === DocVerificationStatus.draft) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_SUBMITTED,
        HttpStatus.CONFLICT,
        'Profile is not submitted for review',
      );
    }

    return this.prisma.docProfile.update({
      where: { id: doc.id },
      data: {
        verificationStatus: DocVerificationStatus.rejected,
        reviewedAt: new Date(),
        rejectionReason: reason.trim(),
      },
      include: { specializations: true },
    });
  }
}
