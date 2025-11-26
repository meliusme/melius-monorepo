import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return status "ok" and set access token cookie on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const mockAccessToken = 'mockAccessToken';
      const mockResponse = {
        cookie: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(authService, 'login')
        .mockResolvedValue({ access_token: mockAccessToken });

      await controller.login(loginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        mockAccessToken,
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          expires: expect.any(Date),
        },
      );
      expect(mockResponse.send).toHaveBeenCalledWith({ status: 'ok' });
    });
  });
  describe('logout', () => {
    it('should clear access token cookie on logout', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      await controller.logout(mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith('access_token', '', {
        expires: expect.any(Date),
      });
    });

    it('should return "Logout success"', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.logout(mockResponse);

      expect(result).toBe('Logout success');
    });
  });
});
