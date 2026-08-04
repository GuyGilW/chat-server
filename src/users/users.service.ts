import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, username: string, hashedPassword: string) {
    return this.prisma.user.create({
      data: { email, username, password: hashedPassword },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true, avatarUrl: true },
    });
  }
  async updateUsername(userId: number, newUsername: string) {
    const existing = await this.findByUsername(newUsername);
    if (existing && existing.id !== userId) {
      throw new ConflictException('This username is already in use');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
      select: { id: true, email: true, username: true, avatarUrl: true },
    });
  }

  async updatePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const matches = await compare(currentPassword, user.password);
    if (!matches) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const hashedPassword = await hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  async updateEmail(userId: number, email: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { email },
      select: { id: true, email: true, username: true, avatarUrl: true },
    });
  }

  async findProfile(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, avatarUrl: true },
    });
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, email: true, username: true, avatarUrl: true },
    });
  }
}
