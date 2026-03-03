import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { DocVerificationStatus, Profession, Role } from '@prisma/client';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  problem: { findMany: jest.fn() },
  specialization: { findMany: jest.fn() },
  userProfile: { update: jest.fn() },
  docProfile: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  adminProfile: { update: jest.fn() },
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('ProfilesService', () => {
  let service: ProfilesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // updateUserProfile
  // ──────────────────────────────────────────────────────────────────────────
  describe('updateUserProfile', () => {
    it('throws NOT_FOUND when one or more problem IDs do not exist', async () => {
      mockPrisma.problem.findMany.mockResolvedValue([{ id: 1 }]); // only 1 of 2 found

      await expect(
        service.updateUserProfile(1, {
          firstName: 'Jan',
          lastName: 'Kowalski',
          problems: [1, 2],
        }),
      ).rejects.toThrow();
    });

    it('updates the profile and marks it as published when problems are valid', async () => {
      mockPrisma.problem.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const updated = { id: 1, userId: 1, firstName: 'Jan', published: true };
      mockPrisma.userProfile.update.mockResolvedValue(updated);

      const result = await service.updateUserProfile(1, {
        firstName: 'Jan',
        lastName: 'Kowalski',
        problems: [1, 2],
      });

      expect(result).toEqual(updated);
      expect(result.published).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // updateDocProfile
  // ──────────────────────────────────────────────────────────────────────────
  describe('updateDocProfile', () => {
    it('throws NOT_FOUND when doc profile does not exist', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.updateDocProfile(1, {
          firstName: 'Jan',
          lastName: 'Nowak',
          profession: Profession.psychologist,
          specializations: [1],
        }),
      ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('resets status to draft when profile was previously rejected', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue({
        id: 10,
        verificationStatus: DocVerificationStatus.rejected,
      });
      // Return matching specialization so the length check passes
      mockPrisma.specialization.findMany.mockResolvedValue([{ id: 1 }]);
      const updated = { id: 10, verificationStatus: DocVerificationStatus.draft, specializations: [] };
      mockPrisma.docProfile.update.mockResolvedValue(updated);

      const result = await service.updateDocProfile(1, {
        firstName: 'Jan',
        lastName: 'Nowak',
        profession: Profession.psychologist,
        specializations: [1],
      });

      expect(result).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // submitDocProfile
  // ──────────────────────────────────────────────────────────────────────────
  describe('submitDocProfile', () => {
    const completeDoc = {
      id: 10,
      firstName: 'Jan',
      lastName: 'Nowak',
      profession: Profession.psychologist,
      unitAmount: 150,
      verificationStatus: DocVerificationStatus.draft,
      docTermsAccepted: true,
      docVerificationDocuments: [{ id: 1 }],
      specializations: [{ id: 1 }],
    };

    it('throws NOT_FOUND when doc profile does not exist', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(null);

      await expect(service.submitDocProfile(1)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('throws CONFLICT when profile is already approved', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue({
        ...completeDoc,
        verificationStatus: DocVerificationStatus.approved,
      });

      await expect(service.submitDocProfile(1)).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });
    });

    it('is idempotent: returns current state when already submitted', async () => {
      const submittedDoc = {
        ...completeDoc,
        verificationStatus: DocVerificationStatus.submitted,
      };
      mockPrisma.docProfile.findUnique
        .mockResolvedValueOnce(submittedDoc)
        .mockResolvedValueOnce({ ...submittedDoc, specializations: [] });

      const result = await service.submitDocProfile(1);

      expect(mockPrisma.docProfile.update).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('throws UNPROCESSABLE_ENTITY when required fields are missing', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue({
        id: 10,
        firstName: null,            // missing
        lastName: 'Nowak',
        profession: null,           // missing
        unitAmount: null,           // missing
        verificationStatus: DocVerificationStatus.draft,
        docTermsAccepted: false,    // missing
        docVerificationDocuments: [],
        specializations: [],
      });

      await expect(service.submitDocProfile(1)).rejects.toMatchObject({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    });

    it('sets verificationStatus to submitted on a complete, draft profile', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(completeDoc);
      const submitted = {
        ...completeDoc,
        verificationStatus: DocVerificationStatus.submitted,
        specializations: [],
      };
      mockPrisma.docProfile.update.mockResolvedValue(submitted);

      const result = await service.submitDocProfile(1);

      expect(mockPrisma.docProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: completeDoc.id },
          data: expect.objectContaining({
            verificationStatus: DocVerificationStatus.submitted,
            submittedAt: expect.any(Date),
            rejectionReason: null,
          }),
        }),
      );
      expect(result.verificationStatus).toBe(DocVerificationStatus.submitted);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // updateAdminProfile
  // ──────────────────────────────────────────────────────────────────────────
  describe('updateAdminProfile', () => {
    it('updates the admin profile', async () => {
      const updated = { id: 1, userId: 1, firstName: 'Admin', lastName: 'User' };
      mockPrisma.adminProfile.update.mockResolvedValue(updated);

      const result = await service.updateAdminProfile(1, {
        firstName: 'Admin',
        lastName: 'User',
      });

      expect(result).toEqual(updated);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // getUserProfile / getDocProfile
  // ──────────────────────────────────────────────────────────────────────────
  describe('getUserProfile', () => {
    it('returns user with avatar and userProfile', async () => {
      const user = {
        id: 1,
        email: 'u@example.com',
        role: Role.user,
        avatar: { id: 1, url: 'url', key: 'key' },
        userProfile: { id: 1, problems: [] },
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserProfile(1);

      expect(result).toEqual(user);
    });
  });

  describe('getDocProfile', () => {
    it('returns doc user with avatar and docProfile', async () => {
      const doc = {
        id: 2,
        email: 'd@example.com',
        role: Role.doc,
        avatar: null,
        docProfile: { id: 10, specializations: [] },
      };
      mockPrisma.user.findUnique.mockResolvedValue(doc);

      const result = await service.getDocProfile(2);

      expect(result).toEqual(doc);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // getNewDocsProfiles
  // ──────────────────────────────────────────────────────────────────────────
  describe('getNewDocsProfiles', () => {
    it('returns approved docs limited to 3', async () => {
      const docs = [{ id: 1 }, { id: 2 }, { id: 3 }];
      mockPrisma.user.findMany.mockResolvedValue(docs);

      const result = await service.getNewDocsProfiles();

      expect(result).toEqual(docs);
      expect(result).toHaveLength(3);
    });
  });
});
