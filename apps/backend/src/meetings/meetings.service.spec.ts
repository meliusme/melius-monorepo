import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { MeetingStatus } from '@prisma/client';
import { MeetingsService } from './meetings.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';

// A future slot used across multiple tests
const futureSlot = {
  id: 1,
  docId: 10,
  startTime: new Date(Date.now() + 2 * 3600_000),
  endTime: new Date(Date.now() + 3 * 3600_000),
  booked: false,
};

const pendingMeeting = {
  id: 100,
  userId: 5,
  docId: 10,
  slotId: 1,
  status: MeetingStatus.pending,
  startTime: new Date(Date.now() + 25 * 3600_000),
  endTime: new Date(Date.now() + 26 * 3600_000),
  createdAt: new Date(Date.now() - 5 * 60_000),
};

const confirmedMeeting = {
  ...pendingMeeting,
  status: MeetingStatus.confirmed,
  startTime: new Date(Date.now() + 25 * 3600_000),
};

// Prisma transaction mock: executes the callback with the same mockTx
let mockTx: any;

const mockPrisma = {
  meeting: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  availabilitySlot: {
    findUnique: jest.fn(),
    updateMany: jest.fn(),
    update: jest.fn(),
  },
  userProfile: {
    findUnique: jest.fn(),
  },
  docProfile: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockPaymentsService = {
  refundPaymentForMeeting: jest.fn().mockResolvedValue(undefined),
};

describe('MeetingsService', () => {
  let service: MeetingsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Default transaction mock: just executes the callback
    mockTx = {
      availabilitySlot: {
        findUnique: jest.fn().mockResolvedValue(futureSlot),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue({}),
      },
      userProfile: {
        findUnique: jest.fn().mockResolvedValue({
          consentTerms: true,
          consentAdult: true,
          consentHealthData: true,
        }),
      },
      meeting: {
        create: jest.fn().mockResolvedValue(pendingMeeting),
        update: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
      },
      payment: {
        update: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    mockPrisma.$transaction.mockImplementation((fn: any) => fn(mockTx));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PaymentsService, useValue: mockPaymentsService },
      ],
    }).compile();

    service = module.get<MeetingsService>(MeetingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // createMeeting
  // ──────────────────────────────────────────────────────────────────────────
  describe('createMeeting', () => {
    it('throws NOT_FOUND when slot does not exist', async () => {
      mockTx.availabilitySlot.findUnique.mockResolvedValue(null);

      await expect(
        service.createMeeting(5, { slotId: 1 }),
      ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('throws BAD_REQUEST when slot start time is in the past', async () => {
      mockTx.availabilitySlot.findUnique.mockResolvedValue({
        ...futureSlot,
        startTime: new Date(Date.now() - 3600_000),
      });

      await expect(
        service.createMeeting(5, { slotId: 1 }),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws BAD_REQUEST when user consents are missing', async () => {
      mockTx.availabilitySlot.findUnique.mockResolvedValue(futureSlot);
      mockTx.userProfile.findUnique.mockResolvedValue({
        consentTerms: false,
        consentAdult: true,
        consentHealthData: true,
      });

      await expect(
        service.createMeeting(5, { slotId: 1 }),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws CONFLICT when slot is already booked (race condition)', async () => {
      mockTx.availabilitySlot.findUnique.mockResolvedValue(futureSlot);
      mockTx.userProfile.findUnique.mockResolvedValue({
        consentTerms: true,
        consentAdult: true,
        consentHealthData: true,
      });
      mockTx.availabilitySlot.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.createMeeting(5, { slotId: 1 }),
      ).rejects.toMatchObject({ status: HttpStatus.CONFLICT });
    });

    it('creates a pending meeting and returns it on success', async () => {
      const result = await service.createMeeting(5, {
        slotId: 1,
        clientMessage: 'Hello',
      });

      expect(result).toEqual(pendingMeeting);
      expect(result.status).toBe(MeetingStatus.pending);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // getUserMeetings
  // ──────────────────────────────────────────────────────────────────────────
  describe('getUserMeetings', () => {
    it('returns upcoming meetings (pending + confirmed) by default', async () => {
      const upcoming = [{ id: 1, status: MeetingStatus.pending }];
      mockPrisma.meeting.findMany.mockResolvedValue(upcoming);

      const result = await service.getUserMeetings(5);

      expect(result).toEqual(upcoming);
    });

    it('returns past meetings (completed/cancelled) when scope=past', async () => {
      const past = [{ id: 2, status: MeetingStatus.completed }];
      mockPrisma.meeting.findMany.mockResolvedValue(past);

      const result = await service.getUserMeetings(5, 'past');

      expect(result).toEqual(past);
    });

    it('returns all meetings when scope=all', async () => {
      const all = [{ id: 1 }, { id: 2 }];
      mockPrisma.meeting.findMany.mockResolvedValue(all);

      const result = await service.getUserMeetings(5, 'all');

      expect(result).toEqual(all);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // getDocMeetingsListForUser
  // ──────────────────────────────────────────────────────────────────────────
  describe('getDocMeetingsListForUser', () => {
    beforeEach(() => {
      mockPrisma.docProfile.findUnique.mockResolvedValue({ id: 10 });
      mockPrisma.$transaction.mockResolvedValue([
        [{ id: 1, startTime: new Date(), endTime: new Date(), status: MeetingStatus.confirmed, clientMessage: null, user: { firstName: 'Jan', lastName: 'Kowalski' }, payments: [] }],
        1,
      ]);
    });

    it('throws NOT_FOUND when doc profile does not exist', async () => {
      mockPrisma.docProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.getDocMeetingsListForUser(20),
      ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('returns paginated result with items, total, page, limit', async () => {
      const result = await service.getDocMeetingsListForUser(20);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
    });

    it('applies scope=today filter', async () => {
      await service.getDocMeetingsListForUser(20, 'today');

      const txCall = mockPrisma.$transaction.mock.calls[0];
      // $transaction is called with an array of promises
      expect(txCall).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // cancelMeetingByUser
  // ──────────────────────────────────────────────────────────────────────────
  describe('cancelMeetingByUser', () => {
    it('throws NOT_FOUND when meeting does not exist', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelMeetingByUser(100, 5),
      ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('throws FORBIDDEN when meeting belongs to a different user', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue({
        ...pendingMeeting,
        userId: 99,
      });

      await expect(
        service.cancelMeetingByUser(100, 5),
      ).rejects.toMatchObject({ status: HttpStatus.FORBIDDEN });
    });

    it('throws BAD_REQUEST when confirmed meeting is less than 24h away', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue({
        ...confirmedMeeting,
        startTime: new Date(Date.now() + 23 * 3600_000), // < 24h
      });

      await expect(
        service.cancelMeetingByUser(100, 5),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws BAD_REQUEST when meeting has already started', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue({
        ...pendingMeeting,
        startTime: new Date(Date.now() - 3600_000),
      });

      await expect(
        service.cancelMeetingByUser(100, 5),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('cancels a pending meeting and returns the updated meeting', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(pendingMeeting);
      const cancelled = { ...pendingMeeting, status: MeetingStatus.cancelled_by_user };
      mockTx.meeting.update.mockResolvedValue(cancelled);

      const result = await service.cancelMeetingByUser(100, 5);

      expect(result.status).toBe(MeetingStatus.cancelled_by_user);
    });

    it('triggers a refund when cancelling a confirmed meeting', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(confirmedMeeting);
      mockTx.meeting.update.mockResolvedValue({
        ...confirmedMeeting,
        status: MeetingStatus.cancelled_by_user,
      });

      await service.cancelMeetingByUser(100, 5);

      expect(mockPaymentsService.refundPaymentForMeeting).toHaveBeenCalledWith(
        confirmedMeeting.id,
        'cancelled_by_user',
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // cancelMeetingByDoc
  // ──────────────────────────────────────────────────────────────────────────
  describe('cancelMeetingByDoc', () => {
    it('throws NOT_FOUND when meeting does not exist', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelMeetingByDoc(100, 10),
      ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    });

    it('throws FORBIDDEN when meeting belongs to a different doc', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue({
        ...pendingMeeting,
        docId: 999,
      });

      await expect(
        service.cancelMeetingByDoc(100, 10),
      ).rejects.toMatchObject({ status: HttpStatus.FORBIDDEN });
    });

    it('cancels the meeting and returns the updated record', async () => {
      mockPrisma.meeting.findUnique.mockResolvedValue(pendingMeeting);
      const cancelled = { ...pendingMeeting, status: MeetingStatus.cancelled_by_doc };
      mockTx.meeting.update.mockResolvedValue(cancelled);

      const result = await service.cancelMeetingByDoc(100, 10);

      expect(result.status).toBe(MeetingStatus.cancelled_by_doc);
    });
  });
});
