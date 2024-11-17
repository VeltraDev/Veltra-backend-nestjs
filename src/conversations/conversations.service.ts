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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConversationResponseDto } from './dto/response/conversation-response.dto';
import { UserSecureResponseDto } from 'src/users/dto/response/user-secure-response.dto';

@Injectable()
export class ConversationsService extends BaseService<Conversation> {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(conversationRepository);
  }

  async validateUserInConversation(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: [
        'users',
        'messages',
        'messages.sender',
        'messages.forwardedMessage',
        'messages.forwardedMessage.sender',
      ],
    });

    if (!conversation) {
      throw new NotFoundException(
        ErrorMessages.CONVERSATION_NOT_FOUND.message.replace(
          '{id}',
          conversationId,
        ),
      );
    }

    const isUserInConversation = conversation.users.some(
      (user) => user.id === userId,
    );
    if (!isUserInConversation) {
      throw new ForbiddenException(
        ErrorMessages.CONVERSATION_NO_ACCESS.message,
      );
    }

    return conversation;
  }

  private async validateIsGroup(conversation: Conversation): Promise<void> {
    if (!conversation.isGroup) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_GROUP_REQUIRED.message,
      );
    }
  }

  private async validateAdmin(
    conversation: Conversation,
    userId: string,
  ): Promise<void> {
    if (!conversation.admin || conversation.admin.id !== userId) {
      throw new ForbiddenException(
        ErrorMessages.CONVERSATION_ADMIN_FORBIDDEN.message,
      );
    }
  }

  async getConversationById(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: [
        'users',
        'messages',
        'messages.sender',
        'messages.forwardedMessage',
        'messages.forwardedMessage.sender',
      ],
    });

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

    conversationsWithLatestMessage.sort((a, b) => {
      const dateA = a.latestMessage
        ? new Date(a.latestMessage.createdAt).getTime()
        : 0;
      const dateB = b.latestMessage
        ? new Date(b.latestMessage.createdAt).getTime()
        : 0;
      return dateB - dateA;
    });

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
        ErrorMessages.CONVERSATION_NOT_FOUND.message.replace('{id}', id),
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
        ErrorMessages.CONVERSATION_USERS_NOT_FOUND.message.replace(
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
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_ONLY_ONE_USER.message,
      );
    }
  }

  async find1vs1Conversation(
    userId1: string,
    userId2: string,
  ): Promise<Conversation | undefined> {
    const conversations = await this.conversationRepository.find({
      where: {
        isGroup: false,
      },
      relations: ['users'],
    });

    return conversations.find((conversation) => {
      const userIds = conversation.users.map((user) => user.id);
      return userIds.includes(userId1) && userIds.includes(userId2);
    });
  }

  async createConversation(
    user: UsersInterface,
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const { users, name, picture } = createConversationDto;

    if (users.includes(user.id)) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_CANNOT_CREATE_WITH_SELF.message,
      );
    }

    if (users.length === 1) {
      const existingConversation = await this.find1vs1Conversation(
        user.id,
        users[0],
      );

      if (existingConversation) {
        throw new BadRequestException(
          ErrorMessages.CONVERSATION_1vs1_ALREADY_EXISTS.message,
        );
      }

      if (name || picture) {
        throw new BadRequestException(
          ErrorMessages.BODY_NAME_PICTURE_FOR_GROUP.message,
        );
      }
    }

    users.push(user.id);

    const userEntities = await this.validateUsersExist(users);

    const isGroup = users.length > 2;
    let conversationName = name || 'New Conversation';
    let conversationPicture = picture || null;

    if (!isGroup && users.length === 2) {
      const otherUser = userEntities.find((u) => u.id !== user.id);

      if (otherUser) {
        conversationName = `${otherUser.firstName} ${otherUser.lastName}`;
        conversationPicture = otherUser.avatar;
      }
    }

    const newConversation = this.conversationRepository.create({
      isGroup,
      users: userEntities,
      admin: isGroup ? userEntities.find((u) => u.id === user.id) : null,
      name: conversationName,
      picture: conversationPicture,
    });

    await this.conversationRepository.save(newConversation);

    const conversationDto = plainToClass(
      ConversationResponseDto,
      newConversation,
    );
    this.eventEmitter.emit('conversation.created', {
      conversation: conversationDto,
      users: userEntities.map((user) =>
        plainToClass(UserSecureResponseDto, user),
      ),
    });

    return newConversation;
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

    await this.conversationRepository.save(conversation);

    const updatedConversation = await this.conversationRepository.findOne({
      where: { id: conversation.id },
      relations: ['users', 'admin'],
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    this.eventEmitter.emit('conversation.groupInfoUpdated', {
      conversation: updatedConversation,
      user,
    });

    return updatedConversation;
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
        ErrorMessages.CONVERSATION_CANNOT_UPDATE_ADMIN_TO_SELF.message.replace(
          '{adminId}',
          adminId,
        ),
      );
    }

    const newAdmin = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!newAdmin || !conversation.users.some((u) => u.id === adminId)) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_ADMIN_NOT_VALID.message,
      );
    }

    const oldAdmin = conversation.admin;
    conversation.admin = newAdmin;

    await this.conversationRepository.save(conversation);

    const updatedConversation = await this.conversationRepository.findOne({
      where: { id: conversation.id },
      relations: ['users', 'admin'],
    });

    this.eventEmitter.emit('conversation.adminGroupUpdated', {
      conversation: updatedConversation,
      oldAdmin,
      newAdmin,
    });

    return updatedConversation;
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

      const updatedConversation = await this.conversationRepository.findOne({
        where: { id: conversation.id },
        relations: ['users', 'admin'],
      });

      const adder = await this.userRepository.findOne({
        where: { id: userId },
      });

      this.eventEmitter.emit('conversation.userAdded', {
        conversation: updatedConversation,
        addedUsers: newUsers,
        adder,
      });
    }

    if (alreadyInGroup.length > 0) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_ALREADY_IN_GROUP_PARTIAL.message.replace(
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
        ErrorMessages.CONVERSATION_ADMIN_CANNOT_REMOVE_SELF.message,
      );
    }

    const removedUsers = conversation.users.filter((user) =>
      userIds.includes(user.id),
    );

    conversation.users = conversation.users.filter(
      (user) => !userIds.includes(user.id),
    );

    await this.removeConversationIfOnlyOneUser(conversation);

    await this.conversationRepository.save(conversation);

    const currentUsers = await this.userRepository.findByIds(
      conversation.users.map((user) => user.id),
    );

    const updatedConversation = await this.conversationRepository.findOne({
      where: { id: conversation.id },
      relations: ['users', 'admin'],
    });

    const conversationDto = plainToClass(
      ConversationResponseDto,
      updatedConversation,
    );
    const currentUsersDto = currentUsers.map((user) =>
      plainToClass(UserSecureResponseDto, user),
    );
    const removedUsersDto = removedUsers.map((user) =>
      plainToClass(UserSecureResponseDto, user),
    );

    const remover = await this.userRepository.findOne({
      where: { id: userId },
    });

    this.eventEmitter.emit('conversation.userGroupRemoved', {
      conversation: conversationDto,
      currentUsers: currentUsersDto,
      removedUsers: removedUsersDto,
      remover,
    });

    return updatedConversation;
  }

  async deleteConversation(id: string, adminId: string): Promise<void> {
    const conversation = await this.validateUserInConversation(id, adminId);
    await this.validateAdmin(conversation, adminId);

    await this.conversationRepository.remove(conversation);

    const deleter = await this.userRepository.findOne({
      where: { id: adminId },
    });

    this.eventEmitter.emit('conversation.deleted', {
      conversationId: id,
      deleter,
    });
  }

  async leaveGroup(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.validateUserInConversation(
      conversationId,
      userId,
    );
    await this.validateIsGroup(conversation);

    if (conversation.admin.id === userId) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_ADMIN_CANNOT_REMOVE_SELF.message,
      );
    }

    conversation.users = conversation.users.filter(
      (user) => user.id !== userId,
    );

    await this.removeConversationIfOnlyOneUser(conversation);

    await this.conversationRepository.save(conversation);

    const updatedConversation = await this.conversationRepository.findOne({
      where: { id: conversation.id },
      relations: ['users', 'admin'],
    });

    const leaver = await this.userRepository.findOne({ where: { id: userId } });

    this.eventEmitter.emit('conversation.userLeft', {
      conversation: updatedConversation,
      userId: userId,
      leaver,
    });
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.users', 'user', 'user.id = :userId', { userId })
      .getMany();
  }
}
