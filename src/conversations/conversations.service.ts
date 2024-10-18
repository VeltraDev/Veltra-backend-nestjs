import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateConversationDto } from './dto/request/create-conversation.dto';
import { UsersInterface } from 'src/users/users.interface';
import { UpdateInfoConversationDto } from './dto/request/update-conversation.dto';
import { Message } from 'src/messages/entities/message.entity';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { BaseService } from 'src/base/base.service';
import { FilterConversationsDto } from './dto/request/filter-conversation.dto';
import { plainToClass } from 'class-transformer';
import { MessageResponseDto } from 'src/messages/dto/response/message-response.dto';

@Injectable()
export class ConversationsService extends BaseService<Conversation> {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {
    super(conversationRepository);
  }

  private async validateUserInConversation(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['users', 'admin', 'messages', 'messages.sender'],
    });

    if (!conversation) {
      throw new NotFoundException(
        ErrorMessages.CONVERSATION_NOT_FOUND.replace('{id}', conversationId),
      );
    }

    const isUserInConversation = conversation.users.some(
      (user) => user.id === userId,
    );
    if (!isUserInConversation) {
      throw new ForbiddenException(ErrorMessages.CONVERSATION_NO_ACCESS);
    }

    return conversation;
  }

  private async validateIsGroup(conversation: Conversation): Promise<void> {
    if (!conversation.isGroup) {
      throw new BadRequestException(ErrorMessages.CONVERSATION_GROUP_REQUIRED);
    }
  }

  private async validateAdmin(
    conversation: Conversation,
    userId: string,
  ): Promise<void> {
    if (!conversation.admin || conversation.admin.id !== userId) {
      throw new ForbiddenException(ErrorMessages.CONVERSATION_ADMIN_FORBIDDEN);
    }
  }

  async getConversationById(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.validateUserInConversation(id, userId);

    const sortedMessages = conversation.messages.sort((a, b) => {
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return {
      ...conversation,
      messages: sortedMessages,
    };
  }

  async getAllConversations(
    userId: string,
    query: FilterConversationsDto,
  ): Promise<{
    total: number;
    page: number;
    limit: number;
    results: any[];
  }> {
    const validSortFields = ['name', 'createdAt'];
    const paginatedConversations = await this.getAll(
      query,
      validSortFields,
      'conversation',
      ['users', 'admin', 'messages'],
    );

    const conversationsWithLatestMessage = await Promise.all(
      paginatedConversations.results.map(async (conversation) => {
        const latestMessage = await this.messageRepository.findOne({
          where: { conversation: { id: conversation.id } },
          order: { createdAt: 'DESC' },
          relations: ['sender'],
        });

        return {
          ...conversation,
          latestMessage: latestMessage
            ? plainToClass(MessageResponseDto, {
                id: latestMessage.id,
                content: latestMessage.content,
                files: latestMessage.files,
                sender: {
                  id: latestMessage.sender.id,
                  firstName: latestMessage.sender.firstName,
                  lastName: latestMessage.sender.lastName,
                  email: latestMessage.sender.email,
                  avatar: latestMessage.sender.avatar,
                },
                createdAt: latestMessage.createdAt,
                updatedAt: latestMessage.updatedAt,
              })
            : null,
        };
      }),
    );

    return {
      total: paginatedConversations.total,
      page: paginatedConversations.page,
      limit: paginatedConversations.limit,
      results: conversationsWithLatestMessage,
    };
  }

  async findConversationById(
    id: string,
    relations: string[] = [],
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations,
    });

    if (!conversation) {
      throw new NotFoundException(
        ErrorMessages.CONVERSATION_NOT_FOUND.replace('{id}', id),
      );
    }

    return conversation;
  }

  async validateUsersExist(userIds: string[]): Promise<User[]> {
    const users = await this.userRepository.findBy({ id: In(userIds) });

    if (users.length !== userIds.length) {
      const foundUserIds = users.map((user) => user.id);
      const missingUserIds = userIds.filter(
        (userId) => !foundUserIds.includes(userId),
      );
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_USERS_NOT_FOUND.replace(
          '{missingUserIds}',
          missingUserIds.join(', '),
        ),
      );
    }

    return users;
  }

  async removeConversationIfOnlyOneUser(
    conversation: Conversation,
  ): Promise<void> {
    if (conversation.users.length === 1) {
      await this.conversationRepository.remove(conversation);
      throw new BadRequestException(ErrorMessages.CONVERSATION_ONLY_ONE_USER);
    }
  }

  async createConversation(
    user: UsersInterface,
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const { users } = createConversationDto;

    if (users.includes(user.id)) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_CANNOT_CREATE_WITH_SELF,
      );
    }

    users.push(user.id);

    const userEntities = await this.validateUsersExist(users);

    const isGroup = users.length > 2;

    const newConversation = this.conversationRepository.create({
      isGroup,
      users: userEntities,
      admin: isGroup ? userEntities.find((u) => u.id === user.id) : null,
    });

    return await this.conversationRepository.save(newConversation);
  }

  async updateGroupInfo(
    id: string,
    updateInfoConversationDto: UpdateInfoConversationDto,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.validateUserInConversation(id, userId);
    await this.validateIsGroup(conversation);
    await this.validateAdmin(conversation, userId);

    const { name, picture } = updateInfoConversationDto;
    if (name) conversation.name = name;
    if (picture) conversation.picture = picture;

    return await this.conversationRepository.save(conversation);
  }

  async updateGroupAdmin(
    id: string,
    adminId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.validateUserInConversation(id, userId);
    await this.validateIsGroup(conversation);
    await this.validateAdmin(conversation, userId);

    if (adminId === userId) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_CANNOT_UPDATE_ADMIN_TO_SELF.replace(
          '{adminId}',
          adminId,
        ),
      );
    }

    const newAdmin = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!newAdmin || !conversation.users.some((u) => u.id === adminId)) {
      throw new BadRequestException(ErrorMessages.CONVERSATION_ADMIN_NOT_VALID);
    }

    conversation.admin = newAdmin;

    return await this.conversationRepository.save(conversation);
  }

  async addUsersToGroup(
    id: string,
    userIds: string[],
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.validateUserInConversation(id, userId);
    await this.validateIsGroup(conversation);

    const usersToAdd = await this.validateUsersExist(userIds);
    const existingUsers = conversation.users.map((user) => user.id);

    const alreadyInGroup = userIds.filter((userId) =>
      existingUsers.includes(userId),
    );

    const newUsers = usersToAdd.filter(
      (user) => !existingUsers.includes(user.id),
    );

    if (newUsers.length > 0) {
      conversation.users.push(...newUsers);
      await this.conversationRepository.save(conversation);
    }

    if (alreadyInGroup.length > 0) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_ALREADY_IN_GROUP_PARTIAL.replace(
          '{alreadyInGroup}',
          alreadyInGroup.join(', '),
        ),
      );
    }

    return conversation;
  }

  async removeUsersFromGroup(
    id: string,
    userIds: string[],
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.validateUserInConversation(id, userId);
    await this.validateIsGroup(conversation);
    await this.validateAdmin(conversation, userId);

    if (conversation.admin.id === userId && userIds.includes(userId)) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_ADMIN_CANNOT_REMOVE_SELF,
      );
    }

    conversation.users = conversation.users.filter(
      (user) => !userIds.includes(user.id),
    );

    await this.removeConversationIfOnlyOneUser(conversation);

    return await this.conversationRepository.save(conversation);
  }

  async deleteConversation(id: string, adminId: string): Promise<void> {
    const conversation = await this.validateUserInConversation(id, adminId);
    await this.validateAdmin(conversation, adminId);

    await this.conversationRepository.remove(conversation);
  }

  async leaveGroup(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.validateUserInConversation(
      conversationId,
      userId,
    );
    await this.validateIsGroup(conversation);

    if (conversation.admin.id === userId) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_ADMIN_CANNOT_REMOVE_SELF,
      );
    }

    conversation.users = conversation.users.filter(
      (user) => user.id !== userId,
    );

    await this.removeConversationIfOnlyOneUser(conversation);

    await this.conversationRepository.save(conversation);
  }
}
