import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(3)
  currenPassword: string;
  @IsString()
  @MinLength(3)
  newPasswrod: string;
}
