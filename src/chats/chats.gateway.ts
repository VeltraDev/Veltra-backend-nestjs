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
import { instanceToPlain, plainToClass } from 'class-transformer';
import { UsersService } from 'src/users/users.service';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { ForwardMessageDto } from 'src/messages/dto/request/forward-message.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { User } from 'src/users/entities/user.entity';
import { ConversationResponseDto } from 'src/conversations/dto/response/conversation-response.dto';
import { MessageResponseDto } from 'src/messages/dto/response/message-response.dto';

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

  private onlineUsers: Map<string, Set<AuthenticatedSocket>> = new Map();
  private activeCalls1To1: Map<string, string> = new Map();

  async handleConnection(client: AuthenticatedSocket) {
    const userId = client.user.id;
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
      const userInfo = await this.getFullUserInfo(userId);
      this.server.emit('userOnline', {
        user: userInfo,
        message: `${userInfo.firstName} ${userInfo.lastName} đang trực tuyến`,
      });
    }
    this.onlineUsers.get(userId).add(client);
    client.join(userId);

    await this.joinUserConversations(userId, client);

    const onlineUserIds = Array.from(this.onlineUsers.keys());
    const onlineUsersInfo = await Promise.all(
      onlineUserIds.map((id) => this.getFullUserInfo(id)),
    );
    client.emit('onlineUsers', {
      users: onlineUsersInfo,
      message: 'Danh sách người dùng hiện tại đang trực tuyến',
    });
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.user.id;
    if (this.onlineUsers.has(userId)) {
      this.onlineUsers.get(userId).delete(client);
      if (this.onlineUsers.get(userId).size === 0) {
        this.onlineUsers.delete(userId);
        const userInfo = await this.getFullUserInfo(userId);
        this.server.emit('userOffline', {
          user: userInfo,
          message: `${userInfo.firstName} ${userInfo.lastName} đang ngoại tuyến`,
        });
      }
    }

    await this.handleCallTermination(userId, 'partner-disconnected');
  }

  private async getUserPlainInfo(userId: string): Promise<any> {
    const userEntity = await this.usersService.getUserById(userId);
    const userDto = plainToClass(UserSecureResponseDto, userEntity);
    return instanceToPlain(userDto, {
      excludeExtraneousValues: true,
    });
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

      const message =
        event === 'typingInfo'
          ? `${userInfo.firstName} ${userInfo.lastName} đang nhập...`
          : `${userInfo.firstName} ${userInfo.lastName} đã ngừng nhập.`;

      this.server.to(conversationId).emit(event, {
        user: userInfo,
        conversationId,
        message: message,
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
          message: `Cuộc gọi đã kết thúc: ${reason}`,
        });
        this.activeCalls1To1.delete(partnerId);
      }

      this.activeCalls1To1.delete(userId);
    }
  }

  private async joinUserConversations(
    userId: string,
    socket: AuthenticatedSocket,
  ) {
    const conversations = await this.chatsService.getUserConversations(userId);

    // User join each conversation to make room
    conversations.forEach((conversation) => {
      socket.join(conversation.id);
    });
  }

  // ----- Server self-event -----

  @OnEvent('conversation.userAdded')
  async handleUserAdded(payload: {
    conversation: Conversation;
    addedUsers: User[];
    adder: User;
  }) {
    const conversationPlain = instanceToPlain(
      plainToClass(ConversationResponseDto, payload.conversation),
      { excludeExtraneousValues: true },
    );

    const addedUsersPlain = await Promise.all(
      payload.addedUsers.map((user) => this.getUserPlainInfo(user.id)),
    );

    const adderPlain = await this.getUserPlainInfo(payload.adder.id);

    const addedUserNames = addedUsersPlain
      .map((user) => `${user.firstName} ${user.lastName}`)
      .join(', ');

    const message = `${adderPlain.firstName} ${adderPlain.lastName} đã thêm ${addedUserNames} vào nhóm ${conversationPlain.name}`;

    for (const user of addedUsersPlain) {
      const sockets = this.onlineUsers.get(user.id);
      if (sockets) {
        sockets.forEach((socket) => {
          socket.join(conversationPlain.id);
        });
      }
    }

    for (const user of addedUsersPlain) {
      const sockets = this.onlineUsers.get(user.id);
      if (sockets) {
        sockets.forEach((socket) => {
          socket.emit('addedToGroup', {
            conversation: conversationPlain,
            message: `Bạn đã được thêm vào nhóm ${conversationPlain.name} bởi ${adderPlain.firstName} ${adderPlain.lastName}`,
          });
        });
      }
    }

    this.server.to(conversationPlain.id).emit('usersAdded', {
      conversation: conversationPlain,
      users: addedUsersPlain,
      message: message,
    });
  }

  @OnEvent('conversation.userGroupRemoved')
  async handleUserRemoved(payload: {
    conversation: ConversationResponseDto;
    currentUsers: UserSecureResponseDto[];
    removedUsers: UserSecureResponseDto[];
    remover: User;
  }) {
    const conversationPlain = instanceToPlain(payload.conversation, {
      excludeExtraneousValues: true,
    });

    const removedUsersPlain = await Promise.all(
      payload.removedUsers.map((user) => this.getUserPlainInfo(user.id)),
    );

    const removerPlain = await this.getUserPlainInfo(payload.remover.id);

    const removedUserNames = removedUsersPlain
      .map((user) => `${user.firstName} ${user.lastName}`)
      .join(', ');

    const message = `${removerPlain.firstName} ${removerPlain.lastName} đã xóa ${removedUserNames} khỏi nhóm ${conversationPlain.name}`;

    const conversationId = conversationPlain.id;

    for (const user of removedUsersPlain) {
      const sockets = this.onlineUsers.get(user.id);
      if (sockets) {
        sockets.forEach((socket) => {
          socket.emit('stopTypingByAdminDeleted', {
            conversationId,
            message: `Bạn đã bị ${removerPlain.firstName} ${removerPlain.lastName} xóa khỏi nhóm ${conversationPlain.name} nên không thể soạn tin`,
          });
        });
      }
    }

    for (const user of removedUsersPlain) {
      const sockets = this.onlineUsers.get(user.id);
      if (sockets) {
        sockets.forEach((socket) => {
          socket.leave(conversationId);
        });
      }
    }

    this.server.to(conversationId).emit('usersRemovedFromGroup', {
      conversation: conversationPlain,
      removedUsers: removedUsersPlain,
      message: message,
    });
  }

  @OnEvent('conversation.groupInfoUpdated')
  async handleInfoUpdated(payload: { conversation: Conversation; user: User }) {
    const conversationPlain = instanceToPlain(
      plainToClass(ConversationResponseDto, payload.conversation),
      { excludeExtraneousValues: true },
    );

    const userPlain = await this.getUserPlainInfo(payload.user.id);

    const message = `${userPlain.firstName} ${userPlain.lastName} đã cập nhật thông tin nhóm ${conversationPlain.name}`;

    this.server.to(conversationPlain.id).emit('conversationGroupInfoUpdated', {
      conversation: conversationPlain,
      message: message,
    });
  }

  @OnEvent('conversation.adminGroupUpdated')
  async handleAdminUpdated(payload: {
    conversation: Conversation;
    oldAdmin: User;
    newAdmin: User;
  }) {
    const conversationPlain = instanceToPlain(
      plainToClass(ConversationResponseDto, payload.conversation),
      { excludeExtraneousValues: true },
    );

    const oldAdminPlain = await this.getUserPlainInfo(payload.oldAdmin.id);
    const newAdminPlain = await this.getUserPlainInfo(payload.newAdmin.id);

    const message = `${oldAdminPlain.firstName} ${oldAdminPlain.lastName} đã chuyển vai trò admin cho ${newAdminPlain.firstName} ${newAdminPlain.lastName}`;

    this.server.to(conversationPlain.id).emit('conversationAdminGroupUpdated', {
      conversation: conversationPlain,
      message: message,
    });
  }

  @OnEvent('conversation.deleted')
  async handleConversationDeleted(payload: {
    conversationId: string;
    deleter: User;
  }) {
    const deleterPlain = await this.getUserPlainInfo(payload.deleter.id);

    const message = `Cuộc trò chuyện với id ${payload.conversationId} đã bị xóa bởi ${deleterPlain.firstName} ${deleterPlain.lastName}`;

    this.server.to(payload.conversationId).emit('conversationDeleted', {
      conversationId: payload.conversationId,
      message: message,
    });

    const clients = this.server.sockets.adapter.rooms.get(
      payload.conversationId,
    );
    if (clients) {
      clients.forEach((socketId) => {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(payload.conversationId);
        }
      });
    }
  }

  @OnEvent('conversation.userLeft')
  async handleUserLeftConversation(payload: {
    conversation: Conversation;
    userId: string;
    leaver: User;
  }) {
    const conversationPlain = instanceToPlain(
      plainToClass(ConversationResponseDto, payload.conversation),
      { excludeExtraneousValues: true },
    );

    const leaverPlain = await this.getUserPlainInfo(payload.leaver.id);

    const message = `${leaverPlain.firstName} ${leaverPlain.lastName} đã rời khỏi nhóm`;

    const sockets = this.onlineUsers.get(payload.userId);
    if (sockets) {
      sockets.forEach((socket) => {
        socket.leave(conversationPlain.id);
        socket.emit('leftGroup', {
          conversation: conversationPlain,
          message: `Bạn đã rời khỏi nhóm ${conversationPlain.name}`,
        });
      });
    }

    this.server.to(conversationPlain.id).emit('userLeftConversation', {
      user: leaverPlain,
      conversation: conversationPlain,
      message: message,
    });
  }

  @OnEvent('conversation.created')
  async handleConversationCreated(payload: {
    conversation: ConversationResponseDto;
    users: UserSecureResponseDto[];
  }) {
    const { conversation, users } = payload;
    const conversationId = conversation.id;

    const conversationPlain = instanceToPlain(conversation, {
      excludeExtraneousValues: true,
    });
    const usersPlain = users.map((user) =>
      instanceToPlain(user, {
        excludeExtraneousValues: true,
      }),
    );

    for (const user of usersPlain) {
      const sockets = this.onlineUsers.get(user.id);
      if (sockets) {
        sockets.forEach((socket) => {
          socket.join(conversationId);
          socket.emit('conversationCreated', {
            conversation: conversationPlain,
            message: `Bạn đã được thêm vào nhóm ${conversationPlain.name}`,
          });
        });
      }
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

      this.server.to(conversation.id).emit('userJoined', {
        user: userInfo,
        message: `Người dùng ${userInfo.firstName} đã tham gia cuộc trò chuyện.`,
      });

      client.emit('joinedConversation', {
        conversation,
        message: 'Bạn đã tham gia cuộc trò chuyện.',
      });
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

      const message = 'Tin nhắn mới.';
      this.server.to(conversationId).emit('receiveMessage', {
        ...messageResponse,
        message: message,
      });

      client.emit('messageSent', {
        ...messageResponse,
        message: 'Tin nhắn đã gửi thành công.',
      });
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
      const newMessage = await this.chatsService.handleForwardMessage(
        client.user,
        forwardDto,
      );

      const messageResponse = plainToClass(MessageResponseDto, newMessage, {
        excludeExtraneousValues: true,
      });

      const conversationId = forwardDto.targetConversationId;
      await this.ensureClientInRoom(client, conversationId);

      this.server.to(conversationId).emit('receiveMessage', {
        ...messageResponse,
        message: 'Tin nhắn đã được chuyển tiếp.',
      });

      client.emit('messageForwarded', {
        ...messageResponse,
        message: 'Bạn đã chuyển tiếp tin nhắn thành công.',
      });
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

      const message = `Trạng thái của người dùng đã được cập nhật thành "${status}".`;
      this.server.emit('displayStatusChanged', {
        user: userInfo,
        status,
        message: message,
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

      const message = `${callerInfo.firstName} đang gọi cho bạn.`;
      await this.server.to(recipientId).emit('receive-call', {
        from: callerInfo,
        offer: data.offer,
        message: message,
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

      const message = `${answererInfo.firstName} đã trả lời cuộc gọi của bạn.`;
      await this.server.to(callerId).emit('call-answered', {
        from: answererInfo,
        answer: data.answer,
        message: message,
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

      const message = `Đã nhận được ICE candidate từ ${senderInfo.firstName}.`;
      await this.server.to(recipientId).emit('ice-candidate', {
        from: senderInfo,
        candidate: data.candidate,
        message: message,
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

      const message = `Người dùng đã kết thúc cuộc gọi.`;
      this.server.to(partnerId).emit('end-call', {
        from: userId,
        reason: 'user-ended-call',
        message: message,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
