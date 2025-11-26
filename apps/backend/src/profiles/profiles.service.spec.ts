import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';
import { UpdateDocProfileDto } from './dtos/update-doc-profile.dto';
import { UpdateAdminProfileDto } from './dtos/update-admin-profile.dto';
import { Profession, Role } from '@prisma/client';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfilesService, PrismaService],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update user profile', async () => {
    const userId = 1;
    const updateUserProfileDto: UpdateUserProfileDto = {
      firstName: 'John',
      lastName: 'Doe',
      sex: 'male',
      problems: [],
    };
    const expectedData = {
      id: 1,
      userId: 1,
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
      published: true,
    };
    const updateSpy = jest
      .spyOn(prismaService.userProfile, 'update')
      .mockResolvedValue(expectedData);

    const result = await service.updateUserProfile(
      userId,
      updateUserProfileDto,
    );

    expect(updateSpy).toHaveBeenCalledWith({
      where: { userId },
      data: { ...updateUserProfileDto, published: true },
    });
    expect(result).toEqual(expectedData);
  });

  it('should update doc profile', async () => {
    const docId = 1;
    const updateDocProfileDto: UpdateDocProfileDto = {
      firstName: 'John',
      lastName: 'Doe',
      workStart: 8,
      workEnd: 16,
      profession: Profession.psychologist,
      specializations: [],
    };
    const expectedData = {
      id: 1,
      docId: 1,
      firstName: 'John',
      lastName: 'Doe',
      workStart: 8,
      workEnd: 16,
      profession: Profession.psychologist,
      published: true,
      rate: null,
      ratesLot: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updateSpy = jest
      .spyOn(prismaService.docProfile, 'update')
      .mockResolvedValue(expectedData);

    const result = await service.updateDocProfile(docId, updateDocProfileDto);

    expect(updateSpy).toHaveBeenCalledWith({
      where: { docId },
      data: { ...updateDocProfileDto, published: true },
    });
    expect(result).toEqual(expectedData);
  });

  it('should update admin profile', async () => {
    const userId = 1;
    const updateAdminProfileDto: UpdateAdminProfileDto = {
      firstName: 'John',
      lastName: 'Doe',
    };
    const expectedData = {
      id: 1,
      userId: 1,
      firstName: 'John',
      lastName: 'Doe',
    };
    const updateSpy = jest
      .spyOn(prismaService.adminProfile, 'update')
      .mockResolvedValue(expectedData);

    const result = await service.updateAdminProfile(
      userId,
      updateAdminProfileDto,
    );

    expect(updateSpy).toHaveBeenCalledWith({
      where: { userId },
      data: updateAdminProfileDto,
    });
    expect(result).toEqual(expectedData);
  });

  it('should return user profile', async () => {
    const userId = 1;
    const userProfile = {
      id: 1,
      userId: 1,
      firstName: 'John',
      lastName: 'Doe',
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      problems: [],
    };
    const user = {
      id: 1,
      email: 'example@mail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      password: 'xxx',
      role: Role.user,
      avatar: {
        id: 1,
        userId: 1,
        url: 'someurl',
        key: 'somekey',
      },
      userProfile,
    };

    jest.spyOn(service, 'getUserProfile').mockResolvedValue(user);

    const result = await service.getUserProfile(userId);

    expect(result).toEqual(user);
  });

  it('should return doc profile', async () => {
    const docId = 1;
    const docProfile = {
      id: 1,
      docId: 1,
      firstName: 'John',
      lastName: 'Doe',
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      profession: Profession.psychologist,
      workStart: 8,
      workEnd: 16,
      rate: null,
      ratesLot: null,
      specializations: [],
    };
    const doc = {
      id: 1,
      email: 'example@mail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      password: 'xxx',
      role: Role.doc,
      avatar: {
        id: 1,
        userId: 1,
        url: 'someurl',
        key: 'somekey',
      },
      docProfile,
    };

    jest.spyOn(service, 'getDocProfile').mockResolvedValue(doc);

    const result = await service.getDocProfile(docId);

    expect(result).toEqual(doc);
  });

  it('should return new docs profiles', async () => {
    const initialId = 1;
    const numDocs = 3;

    const newDocProfiles = Array.from({ length: numDocs }, (_, i) => {
      const docProfile = {
        id: initialId + i,
        docId: initialId + i,
        firstName: 'John',
        lastName: 'Doe',
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        profession: Profession.psychologist,
        workStart: 8,
        workEnd: 16,
        rate: null,
        ratesLot: null,
      };

      const doc = {
        id: initialId + i,
        email: 'example@mail.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        password: 'xxx',
        role: Role.doc,
        avatar: {
          id: initialId + i,
          userId: initialId + i,
          url: 'someurl',
          key: 'somekey',
        },
        docProfile,
      };

      return doc;
    });

    jest.spyOn(service, 'getNewDocsProfiles').mockResolvedValue(newDocProfiles);
    const result = await service.getNewDocsProfiles();

    expect(result).toEqual(newDocProfiles);
    expect(result).toHaveLength(3);
  });
});
