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
import { UserSecureResponseDto } from 'src/users/dto/response/user-secure-response.dto';
import { plainToClass } from 'class-transformer';
import { UsersService } from 'src/users/users.service';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { ForwardMessageDto } from 'src/messages/dto/request/forward-message.dto';

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
  constructor(
    private readonly chatsService: ChatsService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer() server: Server;

  private onlineUsers: Map<string, AuthenticatedSocket> = new Map();
  private activeCalls1To1: Map<string, string> = new Map();

  async handleConnection(client: AuthenticatedSocket) {
    this.onlineUsers.set(client.user.id, client);

    client.join(client.user.id);

    const userInfo = await this.getFullUserInfo(client.user.id);

    this.server.emit('userOnline', { user: userInfo });
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.onlineUsers.delete(client.user.id);

    const userInfo = await this.getFullUserInfo(client.user.id);

    this.server.emit('userOffline', { user: userInfo });

    await this.handleCallTermination(client.user.id, 'partner-disconnected');
  }

  private async ensureClientInRoom(
    client: AuthenticatedSocket,
    conversationId: string,
  ) {
    const isClientInRoom = client.rooms.has(conversationId);
    if (!isClientInRoom) {
      await this.chatsService.handleJoinConversation(
        client.user,
        conversationId,
      );
      client.join(conversationId);
    }
  }

  private async getFullUserInfo(
    userId: string,
  ): Promise<UserSecureResponseDto> {
    const fullUser = await this.usersService.getUserById(userId);
    const userInfo: UserSecureResponseDto = plainToClass(
      UserSecureResponseDto,
      fullUser,
      { excludeExtraneousValues: true },
    );
    return userInfo;
  }

  private async handleTypingEvents(
    event: string,
    client: AuthenticatedSocket,
    conversationId: string,
  ) {
    try {
      await this.ensureClientInRoom(client, conversationId);

      const userInfo = await this.getFullUserInfo(client.user.id);

      this.server.to(conversationId).emit(event, {
        user: userInfo,
        conversationId,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  private isUserInCall(userId: string): boolean {
    return this.activeCalls1To1.has(userId);
  }

  private isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  private async handleCallTermination(userId: string, reason: string) {
    if (this.activeCalls1To1.has(userId)) {
      const partnerId = this.activeCalls1To1.get(userId);

      if (partnerId && this.activeCalls1To1.get(partnerId) === userId) {
        this.server.to(partnerId).emit('end-call', {
          from: userId,
          reason,
        });
        this.activeCalls1To1.delete(partnerId);
      }

      this.activeCalls1To1.delete(userId);
    }
  }

  // ----- Chat real time features -----

  @SubscribeMessage('joinConversation')
  async joinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() request: JoinConversationDto,
  ) {
    try {
      const { conversation, message } =
        await this.chatsService.handleJoinConversation(
          client.user,
          request.conversationId,
        );

      client.join(conversation.id);

      const userInfo = await this.getFullUserInfo(client.user.id);

      this.server
        .to(conversation.id)
        .emit('userJoined', { user: userInfo, message });

      client.emit('joinedConversation', { conversation });
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

  @SubscribeMessage('forwardMessage')
  async forwardMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() forwardDto: ForwardMessageDto,
  ) {
    try {
      const { conversationId, messageResponse } = await this.chatsService.handleForwardMessage(client.user, forwardDto);

      this.server.to(conversationId).emit('receiveForwardMessage', messageResponse);

      client.emit('messageForwarded', messageResponse);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing')
  async typing(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody('conversationId') conversationId: string,
  ) {
    await this.handleTypingEvents('typingInfo', client, conversationId);
  }

  @SubscribeMessage('stopTyping')
  async stopTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody('conversationId') conversationId: string,
  ) {
    await this.handleTypingEvents('stopTypingInfo', client, conversationId);
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

      const userInfo = await this.getFullUserInfo(updatedUser.id);

      this.server.emit('displayStatusChanged', {
        user: userInfo,
        status,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // ----- Video call real time features -----

  @SubscribeMessage('call-user')
  async handleCallUser(
    @MessageBody() data: { to: string; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const callerId = client.user.id;
      const recipientId = data.to;

      if (this.isUserInCall(callerId)) {
        client.emit('call-error', {
          message: ErrorMessages.USER_EXISTED_VIDEO_CALL.message,
        });
        return;
      }

      if (!this.isUserOnline(recipientId)) {
        client.emit('call-error', {
          message: ErrorMessages.USER_NOT_ONLINE_STATUS.message,
        });
        return;
      }

      if (this.isUserInCall(recipientId)) {
        client.emit('call-error', {
          message: ErrorMessages.USER_CALL_ANOTHER_PEOPLE.message,
        });
        return;
      }

      const callerInfo = await this.getFullUserInfo(callerId);

      this.activeCalls1To1.set(callerId, recipientId);
      this.activeCalls1To1.set(recipientId, callerId);

      await this.server.to(recipientId).emit('receive-call', {
        from: callerInfo,
        offer: data.offer,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('answer-call')
  async handleAnswerCall(
    @MessageBody() data: { to: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const answererId = client.user.id;
      const callerId = data.to;

      if (this.activeCalls1To1.get(answererId) !== callerId) {
        client.emit('call-error', {
          message: ErrorMessages.NO_CALL_TO_ANSWER.message,
        });
        return;
      }

      const answererInfo = await this.getFullUserInfo(answererId);

      await this.server.to(callerId).emit('call-answered', {
        from: answererInfo,
        answer: data.answer,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('send-ice-candidate')
  async handleSendIceCandidate(
    @MessageBody() data: { to: string; candidate: RTCIceCandidate },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const senderId = client.user.id;
      const recipientId = data.to;

      const senderInfo = await this.getFullUserInfo(senderId);

      await this.server.to(recipientId).emit('ice-candidate', {
        from: senderInfo,
        candidate: data.candidate,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('end-call')
  async handleEndCall(
    @MessageBody() data: { to: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const userId = client.user.id;
      const partnerId = data.to;

      if (this.activeCalls1To1.get(userId) !== partnerId) {
        client.emit('call-error', {
          message: ErrorMessages.NO_CALL_TO_END.message,
        });
        return;
      }

      await this.handleCallTermination(userId, 'user-ended-call');

      this.server.to(partnerId).emit('end-call', {
        from: userId,
        reason: 'user-ended-call',
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
