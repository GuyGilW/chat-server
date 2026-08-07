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
    const allMemberIds = [...new Set([creatorId, ...memberIds])];
    const chatInclude = {
      members: {
        include: {
          user: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      },
    };
    if (!isGroup && allMemberIds.length === 2) {
      const [userA, userB] = allMemberIds;

      const existingChat = await this.prisma.chat.findFirst({
        where: {
          isGroup: false,
          AND: [
            { members: { some: { userId: userA } } },
            { members: { some: { userId: userB } } },
          ],
        },
        include: chatInclude,
      });

      if (existingChat) {
        return existingChat;
      }
    }
    try {
      const chat = await this.prisma.chat.create({
        data: {
          name,
          isGroup,
          members: {
            create: allMemberIds.map((userId) => ({ userId })),
          },
        },
        include: chatInclude,
      });
      return chat;
    } catch {
      throw new NotFoundException('Id does not exist');
    }
  }
  async findChatsOfUser(userId: number) {
    return this.prisma.chat.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: {
          select: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
      },
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
      include: {
        members: {
          select: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
      },
    });
  }
}
