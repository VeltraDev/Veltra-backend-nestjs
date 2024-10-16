import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { In, Repository } from 'typeorm';
import { CreateConversationDto } from './dto/request/create-conversation.dto';
import { User } from 'src/users/entities/user.entity';
import { plainToClass } from 'class-transformer';
import { PopulateConversationDto } from './dto/request/populate-conversation.dto';
import { Message } from 'src/messages/entities/message.entity';
import { UpdateLatestMessageDto } from './dto/request/update-latest-message.dto';
import { DoesConversationExistDto } from './dto/request/does-conversation-exist.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async doesConversationExist(
    senderId: string,
    receiverId: string,
    isGroup: boolean,
  ): Promise<Conversation | null> {
    if (!isGroup) {
      const conversation = await this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect('conversation.users', 'user')
        .where('conversation.isGroup = :isGroup', { isGroup: false })
        .andWhere('user.id IN (:...userIds)', {
          userIds: [senderId, receiverId],
        })
        .groupBy('conversation.id')
        .having('COUNT(user.id) = 2')
        .getOne();

      return conversation;
    } else {
      const conversation = await this.conversationRepository.findOne({
        where: { id: receiverId, isGroup: true },
        relations: ['users', 'admin', 'latestMessage'],
      });

      return conversation;
    }
  }

  async createConversation(data: CreateConversationDto): Promise<Conversation> {
    const { users, isGroup, name, picture } = data;

    const userEntities = await this.userRepository.findBy({
      id: In(users),
    });

    const foundUserIds = userEntities.map((user) => user.id);
    const missingUserIds = users.filter(
      (userId) => !foundUserIds.includes(userId),
    );

    if (missingUserIds.length > 0) {
      throw new BadRequestException(
        `Người dùng với ID sau không tồn tại: ${missingUserIds.join(', ')}`,
      );
    }

    const newConversation = this.conversationRepository.create({
      name: name || 'New Conversation',
      picture: picture || 'default_image.png',
      isGroup,
      users: userEntities,
    });

    try {
      return await this.conversationRepository.save(newConversation);
    } catch (error) {
      throw new BadRequestException(
        'Oops...Something went wrong while creating the conversation!',
      );
    }
  }

  async createOrOpenConversation(
    senderId: string,
    receiverId: string,
    isGroup: boolean,
  ): Promise<Conversation> {
    if (!isGroup) {
      if (!receiverId) {
        throw new BadRequestException(
          'Please provide the user ID you want to start a conversation with.',
        );
      }

      const existingConversation = await this.doesConversationExist(
        senderId,
        receiverId,
        false,
      );

      if (existingConversation) {
        return existingConversation;
      } else {
        const conversationData: CreateConversationDto = {
          name: 'Conversation Name',
          picture: 'Conversation Picture',
          isGroup: false,
          users: [senderId, receiverId],
        };

        const newConversation = await this.createConversation(conversationData);
        const populatedConversation = await this.populateConversation({
          id: newConversation.id,
          fieldToPopulate: ['users'],
          fieldsToRemove: ['password'],
        });

        return { ...newConversation, ...populatedConversation } as Conversation;
      }
    } else {
      throw new BadRequestException(
        'Group conversation logic not implemented in this method.',
      );
    }
  }

  async createGroupConversation(
    userId: string,
    name: string,
    users: string[],
  ): Promise<Conversation> {
    users.push(userId);

    if (!name || users.length < 2) {
      throw new BadRequestException(
        'Please fill all fields. At least 2 users are required to start a group chat.',
      );
    }

    const conversationData: CreateConversationDto = {
      name,
      users,
      isGroup: true,
      picture: process.env.DEFAULT_GROUP_PICTURE,
    };

    const newConversation = await this.createConversation(conversationData);
    const populatedConversation = await this.populateConversation({
      id: newConversation.id,
      fieldToPopulate: ['users', 'admin'],
      fieldsToRemove: ['password'],
    });

    return { ...newConversation, ...populatedConversation } as Conversation;
  }

  async populateConversation(
    populateConversationDto: PopulateConversationDto,
  ): Promise<Partial<Conversation>> {
    const { id, fieldToPopulate, fieldsToRemove } = populateConversationDto;

    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id },
        relations: fieldToPopulate,
      });

      if (!conversation) {
        throw new NotFoundException(
          `Cuộc trò chuyện với ID ${id} không tồn tại.`,
        );
      }

      let conversationData = plainToClass(Conversation, conversation, {
        excludeExtraneousValues: true,
      });

      if (fieldsToRemove && fieldsToRemove.length > 0) {
        fieldsToRemove.forEach((field) => {
          delete conversationData[field];
        });
      }

      return conversationData;
    } catch (error) {
      throw new BadRequestException(
        'Oops...Something went wrong while populating the conversation!',
      );
    }
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const conversations = await this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect('conversation.users', 'user')
        .leftJoinAndSelect('conversation.admin', 'admin')
        .leftJoinAndSelect('conversation.latestMessage', 'latestMessage')
        .where('user.id = :userId', { userId })
        .orderBy('conversation.updatedAt', 'DESC')
        .getMany();

      return conversations;
    } catch (error) {
      throw new BadRequestException(
        'Oops...Something went wrong while fetching conversations!',
      );
    }
  }

  async updateLatestMessage(
    updateLatestMessageDto: UpdateLatestMessageDto,
  ): Promise<Conversation> {
    const { conversationId, latestMessageId } = updateLatestMessageDto;

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    if (!conversation) {
      throw new NotFoundException(
        `Cuộc trò chuyện với ID ${conversationId} không tồn tại.`,
      );
    }

    const latestMessage = await this.messageRepository.findOne({
      where: { id: latestMessageId },
    });
    if (!latestMessage) {
      throw new NotFoundException(
        `Tin nhắn với ID ${latestMessageId} không tồn tại.`,
      );
    }

    conversation.latestMessage = latestMessage;
    try {
      return await this.conversationRepository.save(conversation);
    } catch (error) {
      throw new BadRequestException(
        'Oops...Something went wrong while updating the latest message!',
      );
    }
  }
}
