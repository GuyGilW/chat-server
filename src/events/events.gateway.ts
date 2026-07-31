import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
@WebSocketGateway({
  cors: { origin: '*' },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconect(client: Socket) {
    console.log(`Client Disconected ${client.id}`);
  }

  @SubscribeMessage('ping')
  handleEcho(@MessageBody() data: string) {
    console.log(`Recived: ${data}`);
    return { event: 'pong', data: `Echo: ${data}` };
  }
}
