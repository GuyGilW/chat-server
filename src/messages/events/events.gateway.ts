import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
  ) {}

  private getUserId(client: Socket): number {
    return (client.data as { userId: number }).userId;
  }

  private setUserId(client: Socket, userId: number): void {
    (client.data as { userId: number }).userId = userId;
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token as string;
      const payload = this.jwtService.verify<{ user_id: number }>(token);
      this.setUserId(client, payload.user_id);
      console.log(`Client connected: ${client.id}, user ${payload.user_id}`);
    } catch (error) {
      console.log('Connection rejected', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client Disconected ${client.id}`);
  }

  @SubscribeMessage('ping')
  handleEcho(@MessageBody() data: string) {
    console.log(`Recived: ${data}`);
    return { event: 'pong', data: `Echo: ${data}` };
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`chat-${chatId}`);
    const userId = this.getUserId(client);
    console.log(`User ${userId} joined chat-${chatId}`);
  }
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { chatId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.getUserId(client);
    const message = await this.messagesService.create(
      userId,
      data.chatId,
      data.content,
    );
    this.server.to(`chat-${data.chatId}`).emit('newMessage', message);
  }

  @SubscribeMessage('messageDelivered')
  async handleDelivered(
    @MessageBody() data: { messageId: number; chatId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.getUserId(client);
    const status = await this.messagesService.markDelivered(
      data.messageId,
      userId,
    );
    this.server.to(`chat-${data.chatId}`).emit('statusUpdate', status);
  }

  @SubscribeMessage('messageSeen')
  async handleSeen(
    @MessageBody() data: { messageId: number; chatId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.getUserId(client);
    const status = await this.messagesService.markSeen(data.messageId, userId);
    this.server.to(`chat-${data.chatId}`).emit('statusUpdate', status);
  }
}
