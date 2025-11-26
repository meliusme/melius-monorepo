import { IsString } from 'class-validator';

export class UpdateAdminProfileDto {
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
}
