import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatsService } from '../chats/chats.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private chatService: ChatsService,
  ) {}

  async create(senderId: number, chatId: number, content: string) {
    await this.chatService.validateMember(chatId, senderId);

    return this.prisma.message.create({
      data: { content, senderId, chatId },
    });
  }
  async findAllInChat(chatId: number, userId: number) {
    await this.chatService.validateMember(chatId, userId);
    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
      },
    });
  }

  async deleteMessage(messageId: number, userId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('This is not your message');
    }

    await this.prisma.message.delete({ where: { id: messageId } });

    return { message: 'Message deleted' };
  }
}
