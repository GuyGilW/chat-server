import { IsString, IsInt } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsInt()
  chatID: number;
}
