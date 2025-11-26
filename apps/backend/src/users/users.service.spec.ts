import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService, roundsOfHashing } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ImageService } from '../image/image.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let imageService: ImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, ImageService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    imageService = module.get<ImageService>(ImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password and call createProfile', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        role: 'user',
      };
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        roundsOfHashing,
      );
      const mockUser = {
        id: 1,
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);
      jest.spyOn(service, 'createProfile').mockResolvedValue(null);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { ...createUserDto, password: hashedPassword },
      });

      expect(service.createProfile).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.role,
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password',
        role: 'user',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 1,
        email: createUserDto.email,
        password: 'xxx',
        role: 'user',
        updatedAt: new Date(Date.now()),
        createdAt: new Date(Date.now()),
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'user1@example.com',
          password: 'xxx',
          role: Role.user,
          updatedAt: new Date(Date.now()),
          createdAt: new Date(Date.now()),
        },
        {
          id: 2,
          email: 'user2@example.com',
          password: 'xxx',
          role: Role.user,
          updatedAt: new Date(Date.now()),
          createdAt: new Date(Date.now()),
        },
      ];
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      const users = await service.findAll();

      expect(users).toEqual(mockUsers);
    });
  });

  it('should add avatar', async () => {
    const userId = 1;
    const imageBuffer = Buffer.from('fakeImageData');
    const filename = 'avatar.jpg';

    const existingAvatar = {
      id: 1,
      key: 'somekey',
      url: 'someurl',
      docId: null,
      userId: 1,
    };

    const findUniqueSpy = jest
      .spyOn(prismaService.avatar, 'findUnique')
      .mockResolvedValue(existingAvatar);

    const deleteAvatarMock = jest
      .spyOn(prismaService.avatar, 'delete')
      .mockResolvedValue(existingAvatar);

    const deleteImageFromS3Spy = jest.spyOn(imageService, 'deleteImageFromS3');

    const uploadImageToS3Spy = jest
      .spyOn(imageService, 'uploadImageToS3')
      .mockResolvedValue({
        id: 2,
        key: 'newkey',
        url: 'newurl',
        userId: 1,
      });

    await service.addAvatar(userId, imageBuffer, filename);

    expect(findUniqueSpy).toHaveBeenCalledWith({ where: { userId } });
    expect(deleteAvatarMock).toHaveBeenCalledWith({
      where: { id: existingAvatar.id },
    });
    expect(deleteImageFromS3Spy).toHaveBeenCalledWith(existingAvatar.id);
    expect(uploadImageToS3Spy).toHaveBeenCalledWith(
      userId,
      imageBuffer,
      filename,
    );

    deleteAvatarMock.mockRestore();
  });

  it('should delete avatar', async () => {
    const userId = 1;

    const existingAvatar = {
      id: 1,
      key: 'somekey',
      url: 'someurl',
      docId: null,
      userId: 1,
    };

    const findUniqueSpy = jest
      .spyOn(prismaService.avatar, 'findUnique')
      .mockResolvedValue(existingAvatar);

    const deleteImageFromS3Spy = jest.spyOn(imageService, 'deleteImageFromS3');

    const deleteAvatarMock = jest
      .spyOn(prismaService.avatar, 'delete')
      .mockResolvedValue(existingAvatar);

    await service.deleteAvatar(userId);

    expect(findUniqueSpy).toHaveBeenCalledWith({ where: { userId: userId } });
    expect(deleteImageFromS3Spy).toHaveBeenCalledWith(existingAvatar.id);
    expect(deleteAvatarMock).toHaveBeenCalledWith({
      where: { id: existingAvatar.id },
    });

    findUniqueSpy.mockRestore();
    deleteImageFromS3Spy.mockRestore();
    deleteAvatarMock.mockRestore();
  });
});
