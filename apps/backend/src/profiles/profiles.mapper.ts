import {
  AdminProfile,
  Avatar,
  DocProfile,
  Problem,
  Specialization,
  User,
  UserProfile,
} from '@prisma/client';
import { toAvatarResponse, toUserResponse } from '../users/users.mapper';
import { AdminProfileResponseDto } from './dtos/admin-profile-response.dto';
import { DocProfileResponseDto } from './dtos/doc-profile-response.dto';
import { DocProfilePublicResponseDto } from './dtos/doc-profile-public-response.dto';
import { DocWithProfileResponseDto } from './dtos/doc-with-profile-response.dto';
import { DocWithProfilePublicResponseDto } from './dtos/doc-with-profile-public-response.dto';
import { UserProfileResponseDto } from './dtos/user-profile-response.dto';
import { UserWithProfileResponseDto } from './dtos/user-with-profile-response.dto';
import { ProblemEntity } from './entities/problem.entity';
import { SpecializationEntity } from './entities/specialization.entity';

export const toUserProfileResponse = (
  profile: UserProfile & { problems: Problem[] },
): UserProfileResponseDto => ({
  userId: profile.userId,
  firstName: profile.firstName ?? null,
  lastName: profile.lastName ?? null,
  problems: profile.problems.map((problem) => new ProblemEntity(problem)),
});

export const toDocProfileResponse = (
  profile: DocProfile & { specializations: Specialization[] },
): DocProfileResponseDto => ({
  docId: profile.docId,
  firstName: profile.firstName ?? null,
  lastName: profile.lastName ?? null,
  profession: profile.profession,
  rate: profile.rate,
  ratesLot: profile.ratesLot,
  sessionPricePln: profile.sessionPricePln,
  specializations: profile.specializations.map(
    (specialization) => new SpecializationEntity(specialization),
  ),
  verificationStatus: profile.verificationStatus,
  rejectionReason: profile.rejectionReason ?? null,
});

export const toDocProfilePublicResponse = (
  profile: DocProfile,
): DocProfilePublicResponseDto => ({
  docId: profile.docId,
  firstName: profile.firstName ?? null,
  lastName: profile.lastName ?? null,
  profession: profile.profession,
  rate: profile.rate,
  ratesLot: profile.ratesLot,
  sessionPricePln: profile.sessionPricePln,
});

export const toUserWithProfileResponse = (
  user: User & { avatar: Avatar | null; userProfile: UserProfile & { problems: Problem[] } },
): UserWithProfileResponseDto => ({
  ...toUserResponse(user),
  avatar: toAvatarResponse(user.avatar),
  userProfile: toUserProfileResponse(user.userProfile),
});

export const toDocWithProfileResponse = (
  user: User & { avatar: Avatar | null; docProfile: DocProfile & { specializations: Specialization[] } },
): DocWithProfileResponseDto => ({
  ...toUserResponse(user),
  avatar: toAvatarResponse(user.avatar),
  docProfile: toDocProfileResponse(user.docProfile),
});

export const toDocWithProfilePublicResponse = (
  user: User & { avatar: Avatar | null; docProfile: DocProfile },
): DocWithProfilePublicResponseDto => ({
  ...toUserResponse(user),
  avatar: toAvatarResponse(user.avatar),
  docProfile: toDocProfilePublicResponse(user.docProfile),
});

export const toAdminProfileResponse = (
  profile: AdminProfile,
): AdminProfileResponseDto => ({
  id: profile.id,
  userId: profile.userId,
  firstName: profile.firstName ?? null,
  lastName: profile.lastName ?? null,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});
