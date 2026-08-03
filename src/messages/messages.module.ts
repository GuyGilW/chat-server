import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { ChatsModule } from '../chats/chats.module';
import { JwtModule } from '@nestjs/jwt';
import { EventsGateway } from './events/events.gateway';

@Module({
  imports: [
    ChatsModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, EventsGateway],
})
export class MessagesModule {}
