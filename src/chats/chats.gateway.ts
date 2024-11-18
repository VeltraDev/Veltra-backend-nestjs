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
  private activeCalls: Map<string, Set<string>> = new Map();

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

  private isUserInCall(conversationId: string, userId: string): boolean {
    if (this.activeCalls.has(conversationId)) {
      return this.activeCalls.get(conversationId).has(userId);
    }
    return false;
  }

  private isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
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

  private async handleCallTermination(userId: string, reason: string) {
    for (const [conversationId, userSet] of this.activeCalls.entries()) {
      if (userSet.has(userId)) {
        const userInfo = await this.getFullUserInfo(userId);
        userSet.forEach(async (participantId) => {
          if (participantId !== userId) {
            const participantInfo = await this.getFullUserInfo(participantId);
            this.server.to(participantId).emit('end-call', {
              from: {
                id: userId,
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
              },
              conversationId,
              reason: reason,
              message: `Người dùng ${userInfo.firstName} ${userInfo.lastName} đã ${reason === 'partner-disconnected' ? 'ngắt kết nối' : 'kết thúc cuộc gọi'}, cuộc gọi đã kết thúc.`,
            });
          }
        });
        this.activeCalls.delete(conversationId);
      }
    }
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
      const { conversationId, message } =
        await this.chatsService.handleForwardMessage(client.user, forwardDto);

      await this.ensureClientInRoom(client, conversationId);

      this.server.to(conversationId).emit('receiveMessage', {
        ...message,
        message: 'Tin nhắn đã được chuyển tiếp.',
      });

      client.emit('messageForwarded', {
        ...message,
        conversationId,
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
  async handleCallUsers(
    @MessageBody()
    data: {
      conversationId: string;
      offer: RTCSessionDescriptionInit;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const callerId = client.user.id;
      const { conversationId, offer } = data;

      await this.ensureClientInRoom(client, conversationId);

      const conversation = await this.chatsService.getConversationById(
        conversationId,
        callerId,
      );

      if (!conversation) {
        client.emit('call-error', {
          message: 'Cuộc trò chuyện không tồn tại',
        });
        return;
      }

      const participantIds = conversation.users
        .map((user) => user.id)
        .filter((id) => id !== callerId);

      const invalidParticipants = participantIds.filter(
        (id) => !conversation.users.some((user) => user.id === id),
      );
      if (invalidParticipants.length > 0) {
        client.emit('call-error', {
          message: 'Một hoặc nhiều người nhận không thuộc cuộc trò chuyện này',
        });
        return;
      }

      const callerInfo = await this.getFullUserInfo(callerId);

      if (conversation.isGroup) {
        participantIds.forEach(async (participantId) => {
          if (this.isUserOnline(participantId)) {
            const participantInfo = await this.getFullUserInfo(participantId);
            this.server.to(participantId).emit('receive-call', {
              from: {
                id: callerId,
                firstName: callerInfo.firstName,
                lastName: callerInfo.lastName,
              },
              conversationId,
              offer,
              message: `Bạn có một cuộc gọi nhóm từ người dùng ${callerInfo.firstName} ${callerInfo.lastName}`,
            });
          }
        });

        this.activeCalls.set(
          conversationId,
          new Set([callerId, ...participantIds]),
        );
      } else {
        const targetId = participantIds[0];
        if (targetId) {
          if (this.isUserOnline(targetId)) {
            const targetInfo = await this.getFullUserInfo(targetId);
            this.server.to(targetId).emit('receive-call', {
              from: {
                id: callerId,
                firstName: callerInfo.firstName,
                lastName: callerInfo.lastName,
              },
              conversationId,
              offer,
              message: `Bạn có một cuộc gọi từ người dùng ${callerInfo.firstName} ${callerInfo.lastName}`,
            });

            this.activeCalls.set(conversationId, new Set([callerId, targetId]));
          } else {
            client.emit('call-error', {
              message: ErrorMessages.USER_NOT_ONLINE_STATUS.message,
            });
          }
        } else {
          client.emit('call-error', {
            message: 'Không tìm thấy người nhận cuộc gọi',
          });
        }
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('answer-call')
  async handleAnswerCall(
    @MessageBody()
    data: {
      conversationId: string;
      answer: RTCSessionDescriptionInit;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const answererId = client.user.id;
      const { conversationId, answer } = data;

      await this.ensureClientInRoom(client, conversationId);

      const conversation = await this.chatsService.getConversationById(
        conversationId,
        answererId,
      );

      if (!conversation) {
        client.emit('call-error', {
          message: 'Cuộc trò chuyện không tồn tại',
        });
        return;
      }

      const answererInfo = await this.getFullUserInfo(answererId);
      const participantIds = conversation.users.map((user) => user.id);

      const activeCall = this.activeCalls.get(conversationId);
      if (!activeCall) {
        client.emit('call-error', {
          message: 'Cuộc gọi không tồn tại hoặc đã kết thúc',
        });
        return;
      }

      const callerId = Array.from(activeCall).find((id) => id !== answererId);
      if (!callerId) {
        client.emit('call-error', {
          message: 'Không tìm thấy người gọi trong cuộc gọi này',
        });
        return;
      }

      const callerInfo = await this.getFullUserInfo(callerId);

      this.server.to(callerId).emit('call-answered', {
        from: {
          id: answererId,
          firstName: answererInfo.firstName,
          lastName: answererInfo.lastName,
        },
        conversationId,
        answer,
        message: `Người dùng ${answererInfo.firstName} ${answererInfo.lastName} đã trả lời cuộc gọi`,
      });

      if (conversation.isGroup) {
        this.server.to(conversationId).emit('call-answered', {
          from: {
            id: answererId,
            firstName: answererInfo.firstName,
            lastName: answererInfo.lastName,
          },
          conversationId,
          answer,
          message: `Người dùng ${answererInfo.firstName} ${answererInfo.lastName} đã trả lời cuộc gọi nhóm`,
        });
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('send-ice-candidate')
  async handleSendIceCandidate(
    @MessageBody()
    data: { conversationId: string; candidate: RTCIceCandidate },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const senderId = client.user.id;
      const { conversationId, candidate } = data;

      await this.ensureClientInRoom(client, conversationId);

      const conversation = await this.chatsService.getConversationById(
        conversationId,
        senderId,
      );

      if (!conversation) {
        client.emit('call-error', {
          message: 'Cuộc trò chuyện không tồn tại.',
        });
        return;
      }

      const senderInfo = await this.getFullUserInfo(senderId);

      const activeCall = this.activeCalls.get(conversationId);
      if (!activeCall) {
        client.emit('call-error', {
          message: 'Cuộc gọi không tồn tại hoặc đã kết thúc.',
        });
        return;
      }

      if (conversation.isGroup) {
        this.server.to(conversationId).emit('ice-candidate', {
          from: {
            id: senderId,
            firstName: senderInfo.firstName,
            lastName: senderInfo.lastName,
          },
          conversationId,
          candidate,
          message: `ICE candidate từ người dùng ${senderInfo.firstName} ${senderInfo.lastName} trong cuộc gọi nhóm.`,
        });
      } else {
        const participantIds = Array.from(activeCall).filter(
          (id) => id !== senderId,
        );
        if (participantIds.length === 0) {
          client.emit('call-error', {
            message: 'Không tìm thấy người nhận cuộc gọi.',
          });
          return;
        }

        const targetId = participantIds[0];
        if (this.isUserOnline(targetId)) {
          const targetInfo = await this.getFullUserInfo(targetId);
          this.server.to(targetId).emit('ice-candidate', {
            from: {
              id: senderId,
              firstName: senderInfo.firstName,
              lastName: senderInfo.lastName,
            },
            conversationId,
            candidate,
            message: `ICE candidate từ người dùng ${senderInfo.firstName} ${senderInfo.lastName}.`,
          });
        } else {
          client.emit('call-error', {
            message: ErrorMessages.USER_NOT_ONLINE_STATUS.message,
          });
        }
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('end-call')
  async handleEndCall(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const userId = client.user.id;
      const { conversationId } = data;

      await this.ensureClientInRoom(client, conversationId);

      const conversation = await this.chatsService.getConversationById(
        conversationId,
        userId,
      );

      if (!conversation) {
        client.emit('call-error', {
          message: 'Cuộc trò chuyện không tồn tại',
        });
        return;
      }

      const participantIds = conversation.users
        .map((user) => user.id)
        .filter((id) => id !== userId);

      const userInfo = await this.getFullUserInfo(userId);

      if (conversation.isGroup) {
        participantIds.forEach(async (participantId) => {
          const participantInfo = await this.getFullUserInfo(participantId);
          this.server.to(participantId).emit('end-call', {
            from: {
              id: userId,
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
            },
            conversationId,
            reason: 'user-ended-call',
            message: `Người dùng ${userInfo.firstName} ${userInfo.lastName} đã kết thúc cuộc gọi nhóm`,
          });
        });
      } else {
        const targetId = participantIds[0];
        if (targetId) {
          const targetInfo = await this.getFullUserInfo(targetId);
          this.server.to(targetId).emit('end-call', {
            from: {
              id: userId,
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
            },
            conversationId,
            reason: 'user-ended-call',
            message: `Người dùng ${userInfo.firstName} ${userInfo.lastName} đã kết thúc cuộc gọi`,
          });
        }
      }

      this.activeCalls.delete(conversationId);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
