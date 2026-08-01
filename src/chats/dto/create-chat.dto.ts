import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';

export class CreateChatDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsBoolean()
  isGroup: boolean;
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  memberIDs: number[];
}
