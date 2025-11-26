import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;
  @IsString()
  @MinLength(8)
  password: string;
}
