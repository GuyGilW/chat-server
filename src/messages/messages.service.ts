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

    const message = await this.prisma.message.create({
      data: { content, senderId, chatId },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { members: true },
    });

    const otherMembersIds = chat!.members
      .map((m) => m.userId)
      .filter((id) => id !== senderId);

    await this.prisma.messageStatus.createMany({
      data: otherMembersIds.map((userId) => ({
        messageId: message.id,
        userId,
        status: 'SENT' as const,
      })),
    });
    return {
      ...message,
      statuses: otherMembersIds.map((userId) => ({
        id: 0,
        messageId: message.id,
        userId,
        status: 'SENT' as const,
      })),
    };
  }

  async findAllInChat(chatId: number, userId: number) {
    await this.chatService.validateMember(chatId, userId);
    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
        statuses: true,
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

  async markDelivered(messageId: number, userId: number) {
    return this.prisma.messageStatus.update({
      where: { messageId_userId: { messageId, userId } },
      data: { status: 'DELIVERED' },
    });
  }

  async markSeen(messageId: number, userId: number) {
    return this.prisma.messageStatus.update({
      where: { messageId_userId: { messageId, userId } },
      data: { status: 'SEEN' },
    });
  }
}
