import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterLightDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
