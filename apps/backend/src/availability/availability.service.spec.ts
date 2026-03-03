import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { DocVerificationStatus } from '@prisma/client';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../prisma/prisma.service';

const approvedDocProfile = {
  id: 1,
  docId: 10,
  verificationStatus: DocVerificationStatus.approved,
};

const mockPrisma = {
  docProfile: {
    findUnique: jest.fn(),
  },
  availabilitySlot: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // create
  // ──────────────────────────────────────────────────────────────────────────
  describe('create', () => {
    const futureStart = new Date(Date.now() + 2 * 3600_000).toISOString();
    const futureEnd = new Date(Date.now() + 3 * 3600_000).toISOString();

    it('throws NOT_FOUND when doc profile does not exist', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.create(10, { startTime: futureStart, endTime: futureEnd }),
      ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('throws FORBIDDEN when doc is not approved', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue({
        ...approvedDocProfile,
        verificationStatus: DocVerificationStatus.draft,
      });

      await expect(
        service.create(10, { startTime: futureStart, endTime: futureEnd }),
      ).rejects.toMatchObject({ status: HttpStatus.FORBIDDEN });
    });

    it('throws BAD_REQUEST when startTime >= endTime', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(approvedDocProfile);

      await expect(
        service.create(10, { startTime: futureEnd, endTime: futureStart }),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws BAD_REQUEST when startTime is in the past', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(approvedDocProfile);
      const pastStart = new Date(Date.now() - 3600_000).toISOString();

      await expect(
        service.create(10, { startTime: pastStart, endTime: futureEnd }),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws CONFLICT when slot overlaps with an existing slot', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(approvedDocProfile);
      mockPrisma.availabilitySlot.findFirst.mockResolvedValue({ id: 99 });

      await expect(
        service.create(10, { startTime: futureStart, endTime: futureEnd }),
      ).rejects.toMatchObject({ status: HttpStatus.CONFLICT });
    });

    it('creates and returns the slot when all validations pass', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(approvedDocProfile);
      mockPrisma.availabilitySlot.findFirst.mockResolvedValue(null);
      const created = {
        id: 5,
        docId: 1,
        startTime: new Date(futureStart),
        endTime: new Date(futureEnd),
        booked: false,
      };
      mockPrisma.availabilitySlot.create.mockResolvedValue(created);

      const result = await service.create(10, {
        startTime: futureStart,
        endTime: futureEnd,
      });

      expect(result).toEqual(created);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // findForDoc
  // ──────────────────────────────────────────────────────────────────────────
  describe('findForDoc', () => {
    it('throws NOT_FOUND when doc profile does not exist', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(null);

      await expect(service.findForDoc(10)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('returns all slots for the doc ordered by startTime', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(approvedDocProfile);
      const slots = [{ id: 1 }, { id: 2 }];
      mockPrisma.availabilitySlot.findMany.mockResolvedValue(slots);

      const result = await service.findForDoc(10);

      expect(result).toEqual(slots);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // findFreeSlotsForDoc
  // ──────────────────────────────────────────────────────────────────────────
  describe('findFreeSlotsForDoc', () => {
    it('returns only future, non-booked slots', async () => {
      const freeSlots = [{ id: 3, booked: false }];
      mockPrisma.availabilitySlot.findMany.mockResolvedValue(freeSlots);

      const result = await service.findFreeSlotsForDoc(1);

      expect(result).toEqual(freeSlots);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // remove
  // ──────────────────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('throws NOT_FOUND when slot does not exist', async () => {
      mockPrisma.availabilitySlot.findUnique.mockResolvedValue(null);

      await expect(service.remove(10, 999)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('throws NOT_FOUND when doc profile does not exist', async () => {
      mockPrisma.availabilitySlot.findUnique.mockResolvedValue({
        id: 5,
        docId: 1,
        booked: false,
      });
      mockPrisma.docProfile.findUnique.mockResolvedValue(null);

      await expect(service.remove(10, 5)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('throws FORBIDDEN when doc is not approved', async () => {
      mockPrisma.availabilitySlot.findUnique.mockResolvedValue({
        id: 5,
        docId: 1,
        booked: false,
      });
      mockPrisma.docProfile.findUnique.mockResolvedValue({
        ...approvedDocProfile,
        verificationStatus: DocVerificationStatus.submitted,
      });

      await expect(service.remove(10, 5)).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('throws FORBIDDEN when slot belongs to a different doc', async () => {
      mockPrisma.availabilitySlot.findUnique.mockResolvedValue({
        id: 5,
        docId: 999,
        booked: false,
      });
      mockPrisma.docProfile.findUnique.mockResolvedValue(approvedDocProfile);

      await expect(service.remove(10, 5)).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('throws CONFLICT when slot is already booked', async () => {
      mockPrisma.availabilitySlot.findUnique.mockResolvedValue({
        id: 5,
        docId: 1,
        booked: true,
      });
      mockPrisma.docProfile.findUnique.mockResolvedValue(approvedDocProfile);

      await expect(service.remove(10, 5)).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });
    });

    it('deletes the slot when all validations pass', async () => {
      const slot = { id: 5, docId: 1, booked: false };
      mockPrisma.availabilitySlot.findUnique.mockResolvedValue(slot);
      mockPrisma.docProfile.findUnique.mockResolvedValue(approvedDocProfile);
      mockPrisma.availabilitySlot.delete.mockResolvedValue(slot);

      const result = await service.remove(10, 5);

      expect(result).toEqual(slot);
    });
  });
});
