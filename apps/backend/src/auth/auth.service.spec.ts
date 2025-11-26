import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtServiceMock: Partial<JwtService>;
  let findUniqueMock: jest.Mock;

  beforeEach(async () => {
    findUniqueMock = jest.fn();

    jwtServiceMock = {
      sign: jest.fn(() => 'mockToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: findUniqueMock,
            },
          },
        },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      findUniqueMock.mockResolvedValue(null);

      await expect(
        service.login('nonexistent@example.com', 'password'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: 1,
        password: await bcrypt.hash('correctPassword', 10),
      };
      findUniqueMock.mockResolvedValue(mockUser);

      await expect(
        service.login('existent@example.com', 'incorrectPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token if login is successful', async () => {
      const mockUser = {
        id: 1,
        email: 'existent@example.com',
        password: await bcrypt.hash('correctPassword', 10),
      };
      findUniqueMock.mockResolvedValue(mockUser);

      const result = await service.login(mockUser.email, 'correctPassword');

      expect(result.access_token).toBe('mockToken');
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({ userId: mockUser.id });
    });
  });
});
