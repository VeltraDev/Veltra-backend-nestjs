import { Injectable } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';
import { UsersService } from 'src/users/users.service';
import { CreateMessageDto } from 'src/messages/dto/request/create-message.dto';
import { plainToClass } from 'class-transformer';
import { MessageResponseDto } from 'src/messages/dto/response/message-response.dto';
import { UsersInterface } from 'src/users/users.interface';
import { UpdateProfileInformationDto } from 'src/users/dto/request/update-profile.dto';

@Injectable()
export class ChatsService {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly conversationService: ConversationsService,
    private readonly userService: UsersService,
  ) {}

  async handleUpdateDisplayStatus(user: UsersInterface, status: string) {
    const updateProfileInformationDto: UpdateProfileInformationDto = {
      displayStatus: status,
    };

    return await this.userService.updateProfileInfo(
      user,
      updateProfileInformationDto,
    );
  }

  async handleJoinConversation(user: UsersInterface, conversationId: string) {
    const conversation =
      await this.conversationService.validateUserInConversation(
        conversationId,
        user.id,
      );

    return {
      conversation,
      message: `${user.firstName} ${user.lastName} đã tham gia cuộc trò chuyện`,
    };
  }

  async handleSendMessages(user: UsersInterface, request: CreateMessageDto) {
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
