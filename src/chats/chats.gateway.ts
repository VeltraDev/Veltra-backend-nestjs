import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatsService } from './chats.service';
import { AuthenticatedSocket } from './secure/authenticated-socketio.interface';
import { CreateMessageDto } from 'src/messages/dto/request/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class ChatsGateway {
  constructor(private readonly chatsService: ChatsService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() request: CreateMessageDto,
  ) {
    try {
      const { newMessage } = await this.chatsService.handleSendMessages(
        client.user,
        request,
      );

      this.server.to(request.conversationId).emit('receiveMessage', newMessage);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
