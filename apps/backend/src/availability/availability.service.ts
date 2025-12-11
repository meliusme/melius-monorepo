import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async create(docUserId: number, dto: CreateAvailabilityDto) {
    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: docUserId },
    });

    if (!docProfile) {
      throw new BadRequestException('Therapist profile not found');
    }

    return this.prisma.availabilitySlot.create({
      data: {
        docId: docProfile.id,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async findForDoc(docUserId: number) {
    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: docUserId },
    });

    if (!docProfile) {
      throw new BadRequestException('Therapist profile not found');
    }

    return this.prisma.availabilitySlot.findMany({
      where: { docId: docProfile.id },
      orderBy: { startTime: 'asc' },
    });
  }

  async findFreeSlotsForDoc(docProfileId: number) {
    return this.prisma.availabilitySlot.findMany({
      where: {
        docId: docProfileId,
        booked: false,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async remove(docUserId: number, slotId: number) {
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new BadRequestException('Slot not found');
    }

    const docProfile = await this.prisma.docProfile.findUnique({
      where: { docId: docUserId },
    });

    if (!docProfile || slot.docId !== docProfile.id) {
      throw new BadRequestException('Cannot delete a slot you do not own');
    }

    if (slot.booked) {
      throw new BadRequestException(
        'Cannot delete a slot that is already booked',
      );
    }

    return this.prisma.availabilitySlot.delete({
      where: { id: slotId },
    });
  }
}
