import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from './secure/authenticated-socketio.interface';
import { JoinConversationDto } from './dto/request/join-conversation.dto';
import { CreateMessageDto } from 'src/messages/dto/request/create-message.dto';
import { ChatsService } from './chats.service';

@WebSocketGateway(8081, {
  cors: {
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
  },
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatsService: ChatsService) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: AuthenticatedSocket) {}

  async handleDisconnect(client: AuthenticatedSocket) {}

  @SubscribeMessage('joinConversation')
  async joinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() request: JoinConversationDto,
  ) {
    try {
      const { conversationId, message } = await this.joinConversationHandler(
        client,
        request.conversationId,
      );
      client.emit('joinedConversation', { conversationId });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leaveConversation')
  async leaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody('conversationId') conversationId: string,
  ) {
    try {
      const { message } = await this.chatsService.handleLeaveConversation(
        client.user,
        conversationId,
      );

      client.leave(conversationId);

      this.server.to(conversationId).emit('userLeft', { message });

      client.emit('leftConversation', { conversationId });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('sendMessage')
  async sendMessages(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() request: CreateMessageDto,
  ) {
    try {
      const conversationId = request.conversationId;

      const isClientInRoom =
        this.server.sockets.adapter.rooms.has(conversationId);
      if (!isClientInRoom || !client.rooms.has(conversationId)) {
        await this.joinConversationHandler(client, conversationId);
      }

      const { messageResponse } = await this.chatsService.handleSendMessages(
        client.user,
        request,
      );

      this.server.to(conversationId).emit('receiveMessage', messageResponse);

      client.emit('messageSent', messageResponse);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody('conversationId') conversationId: string,
  ) {
    try {
      const isClientInRoom =
        this.server.sockets.adapter.rooms.has(conversationId);
      if (!isClientInRoom || !client.rooms.has(conversationId)) {
        await this.joinConversationHandler(client, conversationId);
      }

      this.server.to(conversationId).emit('typing', {
        user: `${client.user.firstName} ${client.user.lastName}`,
        conversationId,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('stopTyping')
  async handleStopTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody('conversationId') conversationId: string,
  ) {
    try {
      const isClientInRoom =
        this.server.sockets.adapter.rooms.has(conversationId);
      if (!isClientInRoom || !client.rooms.has(conversationId)) {
        await this.joinConversationHandler(client, conversationId);
      }

      this.server.to(conversationId).emit('stopTyping', {
        user: `${client.user.firstName} ${client.user.lastName}`,
        conversationId,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  private async joinConversationHandler(
    client: AuthenticatedSocket,
    conversationId: string,
  ) {
    const { conversationId: joinedConversationId, message } =
      await this.chatsService.handleJoinConversation(
        client.user,
        conversationId,
      );

    client.join(joinedConversationId);

    this.server.to(joinedConversationId).emit('userJoined', { message });

    const clientsInRoom =
      this.server.sockets.adapter.rooms.get(joinedConversationId);

    return { conversationId: joinedConversationId, message };
  }
}
