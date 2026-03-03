import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { DocVerificationStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  docProfile: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const submittedDoc = {
  id: 1,
  verificationStatus: DocVerificationStatus.submitted,
};

const approvedDoc = {
  id: 1,
  verificationStatus: DocVerificationStatus.approved,
  specializations: [],
};

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // approveDocProfile
  // ──────────────────────────────────────────────────────────────────────────
  describe('approveDocProfile', () => {
    it('throws NOT_FOUND when doc profile does not exist', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(null);

      await expect(service.approveDocProfile(1)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('throws CONFLICT when doc profile is still in draft state', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue({
        id: 1,
        verificationStatus: DocVerificationStatus.draft,
      });

      await expect(service.approveDocProfile(1)).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });
    });

    it('is idempotent: returns existing profile when already approved', async () => {
      mockPrisma.docProfile.findUnique
        .mockResolvedValueOnce({ id: 1, verificationStatus: DocVerificationStatus.approved })
        .mockResolvedValueOnce(approvedDoc);

      const result = await service.approveDocProfile(1);

      expect(mockPrisma.docProfile.update).not.toHaveBeenCalled();
      expect(result).toEqual(approvedDoc);
    });

    it('sets status to approved and returns the updated profile', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(submittedDoc);
      mockPrisma.docProfile.update.mockResolvedValue(approvedDoc);

      const result = await service.approveDocProfile(1);

      expect(result.verificationStatus).toBe(DocVerificationStatus.approved);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // rejectDocProfile
  // ──────────────────────────────────────────────────────────────────────────
  describe('rejectDocProfile', () => {
    it('throws BAD_REQUEST when reason is empty', async () => {
      await expect(service.rejectDocProfile(1, '')).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('throws BAD_REQUEST when reason is too short (< 3 chars)', async () => {
      await expect(service.rejectDocProfile(1, 'ab')).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('throws NOT_FOUND when doc profile does not exist', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.rejectDocProfile(1, 'Missing credentials'),
      ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('throws CONFLICT when doc profile is in draft state', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue({
        id: 1,
        verificationStatus: DocVerificationStatus.draft,
      });

      await expect(
        service.rejectDocProfile(1, 'Missing credentials'),
      ).rejects.toMatchObject({ status: HttpStatus.CONFLICT });
    });

    it('sets status to rejected and returns the updated profile', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(submittedDoc);
      const rejectedDoc = {
        id: 1,
        verificationStatus: DocVerificationStatus.rejected,
        rejectionReason: 'Missing credentials',
        specializations: [],
      };
      mockPrisma.docProfile.update.mockResolvedValue(rejectedDoc);

      const result = await service.rejectDocProfile(
        1,
        '  Missing credentials  ',
      );

      expect(result.verificationStatus).toBe(DocVerificationStatus.rejected);
      expect(result.rejectionReason).toBe('Missing credentials');
    });
  });
});
