import {
  Body,
  Controller,
  UseGuards,
  Post,
  Param,
  Get,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('make')
  create(
    @Req() req: Request & { user: { userId: number } },
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.create(
      req.user.userId,
      dto.chatId,
      dto.content,
    );
  }

  @Get('chat/:chatId')
  findAllForChat(
    @Req() req: Request & { user: { userId: number } },
    @Param('chatId') chatId: string,
  ) {
    return this.messagesService.findAllInChat(Number(chatId), req.user.userId);
  }
}
