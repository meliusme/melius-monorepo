import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { MeetingStatus } from '@prisma/client';
import { RatingService } from './rating.service';
import { PrismaService } from '../prisma/prisma.service';

const mockUser = { id: 5, email: 'user@example.com' } as any;

const docProfile = { id: 10 };
const userProfile = { id: 20 };
const completedMeeting = {
  id: 50,
  userId: 5,
  docId: 10,
  status: MeetingStatus.completed,
};

let mockTx: any;

const mockPrisma = {
  docProfile: { findUnique: jest.fn() },
  userProfile: { findUnique: jest.fn() },
  meeting: { findUnique: jest.fn() },
  rating: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('RatingService', () => {
  let service: RatingService;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockTx = {
      rating: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 1 }),
        aggregate: jest.fn().mockResolvedValue({
          _avg: { rate: 4.5 },
          _count: { rate: 2 },
        }),
      },
      docProfile: {
        update: jest.fn().mockResolvedValue({ ...docProfile, rate: 4.5, ratesLot: 2, specializations: [] }),
      },
    };
    mockPrisma.$transaction.mockImplementation((fn: any) => fn(mockTx));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // addDocRate
  // ──────────────────────────────────────────────────────────────────────────
  describe('addDocRate', () => {
    const dto = { docId: 10, meetingId: 50, rate: 5, comment: 'Great!' };

    beforeEach(() => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(docProfile);
      mockPrisma.userProfile.findUnique.mockResolvedValue(userProfile);
      mockPrisma.meeting.findUnique.mockResolvedValue(completedMeeting);
    });

    it('throws NOT_FOUND when doc profile does not exist', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(null);

      await expect(service.addDocRate(mockUser, dto)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('throws NOT_FOUND when user profile does not exist', async () => {
      mockPrisma.userProfile.findUnique.mockResolvedValue(null);

      await expect(service.addDocRate(mockUser, dto)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('throws NOT_FOUND when meeting does not exist', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(null);

      await expect(service.addDocRate(mockUser, dto)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('throws FORBIDDEN when meeting belongs to a different user', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue({
        ...completedMeeting,
        userId: 99,
      });

      await expect(service.addDocRate(mockUser, dto)).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('throws BAD_REQUEST when meeting is for a different doctor', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue({
        ...completedMeeting,
        docId: 999,
      });

      await expect(service.addDocRate(mockUser, dto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('throws BAD_REQUEST when meeting is not completed', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue({
        ...completedMeeting,
        status: MeetingStatus.pending,
      });

      await expect(service.addDocRate(mockUser, dto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('throws CONFLICT when a rating already exists for this meeting', async () => {
      mockTx.rating.findFirst.mockResolvedValue({ id: 7 });

      await expect(service.addDocRate(mockUser, dto)).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });
    });

    it('creates rating and returns updated doc profile on success', async () => {
      const result = await service.addDocRate(mockUser, dto);

      expect(result).toHaveProperty('rate', 4.5);
      expect(result).toHaveProperty('ratesLot', 2);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // getDocRatings
  // ──────────────────────────────────────────────────────────────────────────
  describe('getDocRatings', () => {
    it('returns paginated ratings with correct structure', async () => {
      const ratingItems = [
        {
          id: 1,
          rate: 5,
          comment: 'Excellent',
          createdAt: new Date(),
          userId: 20,
          user: { firstName: 'Jan', lastName: 'Kowalski' },
        },
      ];
      mockPrisma.$transaction.mockResolvedValue([ratingItems, 1]);

      const result = await service.getDocRatings(10, 1, 10);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({ id: 1, rate: 5, comment: 'Excellent' });
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('returns empty items and zero total when no ratings exist', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const result = await service.getDocRatings(10, 2, 5);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });
  });
});
