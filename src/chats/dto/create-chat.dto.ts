import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateChatDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsBoolean()
  isGroup: boolean;
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  usernames: string[];
}
