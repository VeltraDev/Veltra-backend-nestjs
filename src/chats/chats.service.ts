import { Injectable } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';
import { UsersService } from 'src/users/users.service';
import { CreateMessageDto } from 'src/messages/dto/request/create-message.dto';
import { JoinConversationDto } from './dto/request/join-conversation.dto';
import { plainToClass } from 'class-transformer';
import { MessageResponseDto } from 'src/messages/dto/response/message-response.dto';

@Injectable()
export class ChatsService {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly conversationService: ConversationsService,
    private readonly userService: UsersService,
  ) {}

  async handleJoinConversation(user: any, conversationId: string) {
    const conversation =
      await this.conversationService.validateUserInConversation(
        conversationId,
        user.id,
      );

    return {
      conversationId: conversation.id,
      message: `${user.firstName} ${user.lastName} đã tham gia cuộc trò chuyện`,
    };
  }

  async handleLeaveConversation(user: any, conversationId: string) {
    return {
      conversationId,
      message: `${user.firstName} ${user.lastName} đã rời khỏi cuộc trò chuyện`,
    };
  }

  async handleSendMessages(user: any, request: CreateMessageDto) {
    const { conversationId } = request;

    const conversation =
      await this.conversationService.validateUserInConversation(
        conversationId,
        user.id,
      );

    const newMessage = await this.messagesService.createMessage(
      request,
      user.id,
    );

    const messageResponse = plainToClass(MessageResponseDto, newMessage, {
      excludeExtraneousValues: true,
    });

    return { conversationId: conversation.id, messageResponse };
  }
}
