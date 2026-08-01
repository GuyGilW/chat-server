import {
  Controller,
  UseGuards,
  Post,
  Body,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @Post('make')
  create(
    @Req() req: Request & { user: { userId: number } },
    @Body() dto: CreateChatDto,
  ) {
    return this.chatsService.createChat(
      req.user.userId,
      dto.name,
      dto.isGroup,
      dto.memberIDs,
    );
  }

  @Get('get')
  findAll(@Req() req: Request & { user: { userId: number } }) {
    return this.chatsService.findChatsOfUser(req.user.userId);
  }
  @Post(':id/members/:userId')
  addMember(
    @Req() req: Request & { user: { userId: number } },
    @Param('id') chatId: string,
    @Param('userId') newUserId: string,
  ) {
    return this.chatsService.addMember(
      Number(chatId),
      req.user.userId,
      Number(newUserId),
    );
  }
}
