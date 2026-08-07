import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}
  async createChat(
    creatorId: number,
    name: string | undefined,
    isGroup: boolean,
    memberIds: number[],
  ) {
    const allMemeberIds = [...new Set([creatorId, ...memberIds])];
    try {
      const chat = await this.prisma.chat.create({
        data: {
          name,
          isGroup,
          members: {
            create: allMemeberIds.map((userId) => ({ userId })),
          },
        },
        include: { members: true },
      });
      return chat;
    } catch {
      throw new NotFoundException('Id does not exist');
    }
  }
  async findChatsOfUser(userId: number) {
    return this.prisma.chat.findMany({
      where: { members: { some: { userId } } },
      include: { members: true },
    });
  }

  async addMember(chatId: number, requesterId: number, newUserId: number) {
    await this.validateMember(chatId, requesterId);
    return this.prisma.chatMember.create({
      data: { chatId, userId: newUserId },
    });
  }

  async validateMember(chatId: number, userId: number) {
    const membership = await this.prisma.chatMember.findUnique({
      where: { userId_chatId: { userId, chatId } },
    });
    if (!membership) {
      throw new ForbiddenException('You are not part of this chat');
    }
    return membership;
  }

  async leaveChat(chatId: number, userId: number) {
    await this.validateMember(chatId, userId);
    await this.prisma.chatMember.delete({
      where: { userId_chatId: { userId, chatId } },
    });
    return { message: 'You left the chat' };
  }

  async removeMember(
    chatId: number,
    requesterId: number,
    targetUserId: number,
  ) {
    await this.validateMember(chatId, requesterId);

    await this.validateMember(chatId, targetUserId);

    await this.prisma.chatMember.delete({
      where: { userId_chatId: { userId: targetUserId, chatId } },
    });

    return { message: 'Member removed' };
  }

  async deleteChat(chatId: number, userId: number) {
    await this.validateMember(chatId, userId);

    await this.prisma.chat.delete({ where: { id: chatId } });

    return { message: 'Chat deleted' };
  }

  async findOne(chatId: number, userId: number) {
    await this.validateMember(chatId, userId);

    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { members: true },
    });
  }
}
