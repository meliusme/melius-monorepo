import { HttpStatus, Injectable } from '@nestjs/common';
import { DocVerificationStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { throwAppError } from '../common/errors/throw-app-error';
import { ErrorCode } from '../common/errors/error-codes';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async create(docUserId: number, dto: CreateAvailabilityDto) {
    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: docUserId },
    });

    if (!docProfile) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Therapist profile not found',
      );
    }

    if (docProfile.verificationStatus !== DocVerificationStatus.approved) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_APPROVED,
        HttpStatus.FORBIDDEN,
        'You can add availability only after approval',
      );
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throwAppError(
        ErrorCode.INVALID_TIME_RANGE,
        HttpStatus.BAD_REQUEST,
        'Invalid startTime/endTime',
      );
    }

    if (startTime >= endTime) {
      throwAppError(
        ErrorCode.INVALID_TIME_RANGE,
        HttpStatus.BAD_REQUEST,
        'startTime must be before endTime',
      );
    }

    const now = new Date();
    if (startTime <= now) {
      throwAppError(
        ErrorCode.INVALID_TIME_RANGE,
        HttpStatus.BAD_REQUEST,
        'startTime must be in the future',
      );
    }

    // Overlap: istnieje slot gdzie existing.start < new.end AND existing.end > new.start
    const overlap = await this.prisma.availabilitySlot.findFirst({
      where: {
        docId: docProfile.id,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      select: { id: true },
    });

    if (overlap) {
      throwAppError(
        ErrorCode.AVAILABILITY_SLOT_OVERLAP,
        HttpStatus.CONFLICT,
        'Availability slot overlaps with existing slot',
      );
    }

    return this.prisma.availabilitySlot.create({
      data: {
        docId: docProfile.id,
        startTime,
        endTime,
      },
    });
  }

  async findForDoc(docUserId: number) {
    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: docUserId },
    });

    if (!docProfile) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Therapist profile not found',
      );
    }

    return this.prisma.availabilitySlot.findMany({
      where: { docId: docProfile.id },
      orderBy: { startTime: 'asc' },
    });
  }

  async findFreeSlotsForDoc(docProfileId: number) {
    const now = new Date();
    return this.prisma.availabilitySlot.findMany({
      where: {
        docId: docProfileId,
        booked: false,
        startTime: { gt: now },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async remove(docUserId: number, slotId: number) {
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throwAppError(
        ErrorCode.SLOT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Slot not found',
      );
    }

    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: docUserId },
    });

    if (!docProfile) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Therapist profile not found',
      );
    }

    if (docProfile.verificationStatus !== DocVerificationStatus.approved) {
      throwAppError(
        ErrorCode.DOC_PROFILE_NOT_APPROVED,
        HttpStatus.FORBIDDEN,
        'You can manage availability only after approval',
      );
    }

    if (slot.docId !== docProfile.id) {
      throwAppError(
        ErrorCode.SLOT_NOT_OWNED,
        HttpStatus.FORBIDDEN,
        'Cannot delete a slot you do not own',
      );
    }
    if (slot.booked) {
      throwAppError(
        ErrorCode.SLOT_ALREADY_BOOKED,
        HttpStatus.CONFLICT,
        'Cannot delete a slot that is already booked',
      );
    }

    return this.prisma.availabilitySlot.delete({
      where: { id: slotId },
    });
  }
}
