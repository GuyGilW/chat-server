import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [AuthModule, PrismaModule, UsersModule, ChatsModule, MessagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
