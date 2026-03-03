import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  userProfile: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(() => 'mock-access-token'),
};

const mockEmailService = {
  sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Default: no active sessions
    mockPrisma.refreshToken.findMany.mockResolvedValue([]);
    mockPrisma.refreshToken.create.mockResolvedValue({ id: 99 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // login
  // ──────────────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('throws UNAUTHORIZED when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login('nobody@example.com', 'pass'),
      ).rejects.toMatchObject({ status: HttpStatus.UNAUTHORIZED });
    });

    it('throws FORBIDDEN when email is not confirmed', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: 'hashed:secret',
        emailConfirmed: false,
      });

      await expect(
        service.login('user@example.com', 'secret'),
      ).rejects.toMatchObject({ status: HttpStatus.FORBIDDEN });
    });

    it('throws UNAUTHORIZED when password is invalid', async () => {
      // bcrypt mock: compare returns true only when hashed === `hashed:${data}`
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: 'hashed:correct',
        emailConfirmed: true,
      });

      // 'wrong' hashed would be 'hashed:wrong', which != 'hashed:correct'
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        service.login('user@example.com', 'wrong'),
      ).rejects.toMatchObject({ status: HttpStatus.UNAUTHORIZED });
    });

    it('returns AuthEntity with user and issued tokens on success', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        password: 'hashed:secret',
        emailConfirmed: true,
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login('user@example.com', 'secret');

      expect(result.user).toEqual(mockUser);
      expect(result.issued).toHaveProperty('accessToken');
      expect(result.issued).toHaveProperty('refreshToken');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // registerLight
  // ──────────────────────────────────────────────────────────────────────────
  describe('registerLight', () => {
    it('throws BAD_REQUEST when consents are missing', async () => {
      await expect(
        service.registerLight('a@b.com', 'A', 'B', false, true, true),
      ).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
    });

    it('throws CONFLICT when a confirmed user with that email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 2,
        emailConfirmed: true,
        userProfile: null,
      });

      await expect(
        service.registerLight('existing@b.com', 'A', 'B', true, true, true),
      ).rejects.toMatchObject({ status: HttpStatus.CONFLICT });
    });

    it('creates a new light user when email is unknown', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const newUser = { id: 10, email: 'new@b.com', language: 'pl' };
      mockPrisma.user.create.mockResolvedValue(newUser);

      const result = await service.registerLight(
        'new@b.com',
        'Jan',
        'Kowalski',
        true,
        true,
        true,
      );

      expect(result.user).toEqual(newUser);
      expect(result.issued).toHaveProperty('accessToken');
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalled();
    });

    it('re-uses existing unconfirmed user and returns a new session', async () => {
      const existingUser = {
        id: 5,
        emailConfirmed: false,
        language: 'pl',
        role: 'user',
        userProfile: { id: 3 },
      };
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.userProfile.update.mockResolvedValue({});

      const result = await service.registerLight(
        'existing@b.com',
        'A',
        'B',
        true,
        true,
        true,
      );

      expect(result.user).toEqual(existingUser);
      expect(result.issued).toHaveProperty('accessToken');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // setPassword
  // ──────────────────────────────────────────────────────────────────────────
  describe('setPassword', () => {
    it('hashes the password, sets emailConfirmed=true, returns AuthEntity', async () => {
      const updatedUser = {
        id: 7,
        email: 'u@b.com',
        emailConfirmed: true,
        language: 'pl',
      };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.setPassword(7, 'NewPass123!');

      expect(result.user).toEqual(updatedUser);
      expect(result.issued).toHaveProperty('accessToken');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // refreshSession
  // ──────────────────────────────────────────────────────────────────────────
  describe('refreshSession', () => {
    it('throws UNAUTHORIZED when token is not found in DB', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshSession('bogus-token')).rejects.toMatchObject(
        { status: HttpStatus.UNAUTHORIZED },
      );
    });

    it('throws UNAUTHORIZED and revokes all sessions on token reuse', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 1,
        userId: 3,
        revokedAt: new Date(), // already revoked = reuse
        expiresAt: new Date(Date.now() + 100_000),
      });
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      await expect(service.refreshSession('reused-token')).rejects.toMatchObject(
        { status: HttpStatus.UNAUTHORIZED },
      );

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 3, revokedAt: null }),
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
    });

    it('throws UNAUTHORIZED when token is expired', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 2,
        userId: 4,
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000),
      });
      mockPrisma.refreshToken.update.mockResolvedValue({});

      await expect(service.refreshSession('expired-token')).rejects.toMatchObject(
        { status: HttpStatus.UNAUTHORIZED },
      );
    });

    it('issues new tokens and revokes the old one on a valid token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 10,
        userId: 20,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1_000_000),
      });
      mockPrisma.refreshToken.update.mockResolvedValue({});

      const result = await service.refreshSession('valid-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // issueSession — session limit enforcement
  // ──────────────────────────────────────────────────────────────────────────
  describe('issueSession', () => {
    it('revokes the oldest session when the limit is reached', async () => {
      const activeSessions = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        createdAt: new Date(Date.now() - (5 - i) * 60_000),
      }));
      mockPrisma.refreshToken.findMany.mockResolvedValue(activeSessions);
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      await service.issueSession(1);

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { in: [activeSessions[0].id] },
          }),
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
    });

    it('does not revoke anything when under the session limit', async () => {
      mockPrisma.refreshToken.findMany.mockResolvedValue([
        { id: 1, createdAt: new Date() },
      ]);

      await service.issueSession(1);

      expect(mockPrisma.refreshToken.updateMany).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // revokeRefreshToken
  // ──────────────────────────────────────────────────────────────────────────
  describe('revokeRefreshToken', () => {
    it('calls updateMany with the hashed token', async () => {
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      await service.revokeRefreshToken('some-raw-token');

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ revokedAt: null }),
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
    });
  });
});
