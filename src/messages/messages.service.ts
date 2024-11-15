import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { ConversationsService } from 'src/conversations/conversations.service';
import { User } from 'src/users/entities/user.entity';
import { CreateMessageDto } from './dto/request/create-message.dto';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { BaseService } from 'src/base/base.service';
import { ForwardMessageDto } from './dto/request/forward-message.dto';
import { Conversation } from 'src/conversations/entities/conversation.entity';

@Injectable()
export class MessagesService extends BaseService<Message> {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly conversationService: ConversationsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(messageRepository);
  }

  async forwardMessage(forwardDto: ForwardMessageDto, userId: string) {
    const { originalMessageId, targetConversationId } = forwardDto;

    const originalMessage = await this.findMessageById(
      originalMessageId,
      userId,
    );

    const targetConversation =
      await this.conversationService.findConversationById(
        targetConversationId,
        ['users'],
      );

    const isInTargetConversation = targetConversation.users.some(
      (user) => user.id === userId,
    );
    if (!isInTargetConversation) {
      throw new ForbiddenException(
        ErrorMessages.CONVERSATION_NO_ACCESS.message,
      );
    }

    const sender = await this.userRepository.findOne({ where: { id: userId } });

    const newMessage = this.messageRepository.create({
      content: originalMessage.content,
      files: originalMessage.files,
      sender,
      conversation: targetConversation,
      forwardedMessage: originalMessage,
    });

    await this.messageRepository.save(newMessage);

    return newMessage;
  }

  async createMessage(
    createMessageDto: CreateMessageDto,
    senderId: string,
  ): Promise<Message> {
    const { content, conversationId, files } = createMessageDto;

    if (!content && (!files || files.length === 0)) {
      throw new BadRequestException(
        ErrorMessages.AT_LEAST_CONTENT_OR_FILES.message,
      );
    }

    const conversation = await this.conversationService.getConversationById(
      conversationId,
      senderId,
    );

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    if (!sender || !conversation.users.some((user) => user.id === senderId)) {
      throw new ForbiddenException(
        ErrorMessages.MESSAGE_SENDER_NOT_IN_CONVERSATION.message.replace(
          '{senderId}',
          senderId,
        ),
      );
    }

    const newMessage = this.messageRepository.create({
      content,
      sender,
      conversation,
      files: files || null,
    });

    return await this.messageRepository.save(newMessage);
  }

  async findMessageById(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'conversation', 'conversation.users'],
    });

    if (!message) {
      throw new NotFoundException(
        ErrorMessages.MESSAGE_NOT_FOUND.message.replace(
          '{messageId}',
          messageId,
        ),
      );
    }

    if (
      !message.conversation.users ||
      !Array.isArray(message.conversation.users)
    ) {
      message.conversation =
        await this.conversationService.findConversationById(
          message.conversation.id,
          ['users'],
        );

      if (
        !message.conversation.users ||
        !Array.isArray(message.conversation.users)
      ) {
        throw new NotFoundException(
          ErrorMessages.DATA_CONVERSATION_MISSING_OR_INVALID.message,
        );
      }
    }

    const isUserInConversation = message.conversation.users.some(
      (user) => user.id === userId,
    );
    if (!isUserInConversation)
      throw new ForbiddenException(ErrorMessages.MESSAGE_NO_ACCESS.message);

    return message;
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.findMessageById(messageId, userId);

    if (message.sender.id !== userId)
      throw new ForbiddenException(
        ErrorMessages.MESSAGE_DELETE_FORBIDDEN.message,
      );

    await this.messageRepository.remove(message);
  }

  async getMessagesByConversationId(
    conversationId: string,
  ): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender', 'forwardedMessage', 'forwardedMessage.sender'],
      order: { createdAt: 'DESC' },
    });
  }
}
