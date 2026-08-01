import { ForbiddenException, Injectable } from '@nestjs/common';
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
    return this.prisma.chat.create({
      data: {
        name,
        isGroup,
        members: {
          create: allMemeberIds.map((userId) => ({ userId })),
        },
      },
      include: { members: true },
    });
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
}
