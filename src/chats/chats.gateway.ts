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
import { UpdateStatusDto } from './dto/request/update-status.dto';

@WebSocketGateway(8081, {
  cors: {
    origin: [
      'https://localhost:3001',
      'https://localhost:3000',
      'https://localhost:5173',
    ],
    credentials: true,
  },
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatsService: ChatsService) {}

  @WebSocketServer() server: Server;

  private onlineUsers: Map<string, AuthenticatedSocket> = new Map();

  async handleConnection(client: AuthenticatedSocket) {
    this.onlineUsers.set(client.user.id, client);
    this.server.emit('userOnline', { userId: client.user.id });
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.onlineUsers.delete(client.user.id);
    this.server.emit('userOffline', { userId: client.user.id });
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

    return { conversationId: joinedConversationId, message };
  }

  private async ensureClientInRoom(
    client: AuthenticatedSocket,
    conversationId: string,
  ) {
    const isClientInRoom =
      this.server.sockets.adapter.rooms.has(conversationId);
    if (!isClientInRoom || !client.rooms.has(conversationId))
      await this.joinConversationHandler(client, conversationId);
  }

  @SubscribeMessage('joinConversation')
  async joinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() request: JoinConversationDto,
  ) {
    try {
      const { conversationId } = await this.joinConversationHandler(
        client,
        request.conversationId,
      );
      client.emit('joinedConversation', { conversationId });
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

      await this.ensureClientInRoom(client, conversationId);

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
  async typing(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody('conversationId') conversationId: string,
  ) {
    try {
      await this.ensureClientInRoom(client, conversationId);

      this.server.to(conversationId).emit('typingInfo', {
        user: `${client.user.firstName} ${client.user.lastName}`,
        conversationId,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('stopTyping')
  async stopTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody('conversationId') conversationId: string,
  ) {
    try {
      await this.ensureClientInRoom(client, conversationId);

      this.server.to(conversationId).emit('stopTypingInfo', {
        user: `${client.user.firstName} ${client.user.lastName}`,
        conversationId,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('updateDisplayStatus')
  async displayStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: UpdateStatusDto,
  ) {
    try {
      const { status } = data;

      const updatedUser = await this.chatsService.handleUpdateDisplayStatus(
        client.user,
        status,
      );

      this.server.emit('displayStatusChanged', {
        userId: updatedUser.id,
        status,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
