import { IsBoolean, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class SignInDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsBoolean()
  rememberMe: boolean;
}
