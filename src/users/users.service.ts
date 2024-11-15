import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersInterface } from './users.interface';
import { UpdateProfilePasswordDto } from './dto/request/update-password.dto';
import {
  getHashPassword,
  isValidPassword,
} from 'src/common/utils/hashPassword';
import { UpdateProfileInformationDto } from './dto/request/update-profile.dto';
import { FilterUsersDto } from './dto/request/filter-user.dto';
import { UpdateUserAdminDto } from './dto/request/update-user-admin.dto';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { RolesService } from 'src/roles/roles.service';
import { BaseService } from 'src/base/base.service';
import { CreateUserDto } from './dto/request/create-user.dto';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roleService: RolesService,
  ) {
    super(userRepository);
  }

  private async validatePasswordMatch(
    currentPassword: string,
    foundUser: User,
  ) {
    const validPassword = await isValidPassword(
      currentPassword,
      foundUser.password,
    );
    if (!validPassword) {
      throw new BadRequestException(
        ErrorMessages.CURRENT_PASSWORD_INCORRECT.message,
      );
    }
  }

  private async checkNewPassword(newPassword: string, foundUser: User) {
    const isNewPasswordSameAsCurrent = await isValidPassword(
      newPassword,
      foundUser.password,
    );
    if (isNewPasswordSameAsCurrent) {
      throw new BadRequestException(
        ErrorMessages.PASSWORD_SAME_AS_CURRENT.message,
      );
    }
  }

  async updatePassword(
    user: UsersInterface,
    updateProfilePasswordDto: UpdateProfilePasswordDto,
  ): Promise<User> {
    const { currentPassword, newPassword, confirmPassword } =
      updateProfilePasswordDto;

    if (newPassword !== confirmPassword)
      throw new BadRequestException(
        ErrorMessages.CONFIRM_PASSWORD_MATCH.message,
      );

    const foundUser = await this.getUserById(user.id);

    await this.validatePasswordMatch(currentPassword, foundUser);
    await this.checkNewPassword(newPassword, foundUser);

    foundUser.password = getHashPassword(newPassword);
    await this.userRepository.save(foundUser);

    return foundUser;
  }

  async updateProfileInfo(
    user: UsersInterface,
    updateProfileInformationDto: UpdateProfileInformationDto,
  ): Promise<User> {
    const foundUser = await this.getUserById(user.id);

    Object.assign(foundUser, updateProfileInformationDto);

    await this.userRepository.save(foundUser);

    return foundUser;
  }

  private async validateUserUniqueness(email: string) {
    const [emailExists] = await Promise.all([this.isUserExistsByEmail(email)]);

    if (emailExists) {
      throw new BadRequestException(
        ErrorMessages.EMAIL_ALREADY_USED.message.replace('{email}', email),
      );
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.validateUserUniqueness(createUserDto.email);
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async update(id: string, updateUserDto: Partial<User>): Promise<void> {
    const user = await this.getUserById(id);
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getAllUsersWithQuery(query: FilterUsersDto) {
    const validSortFields = [
      'createdAt',
      'email',
      'firstName',
      'lastName',
      'displayStatus',
    ];

    return this.getAll(query, validSortFields, 'user', [
      'role',
      'role.permissions',
    ]);
  }

  async updateUserById(
    id: string,
    updateUserAdminDto: UpdateUserAdminDto,
  ): Promise<User> {
    const user = await this.getUserById(id);

    if (updateUserAdminDto.roleId) {
      const role = await this.roleService.getRoleById(
        updateUserAdminDto.roleId,
      );
      user.role = role;
    }

    Object.assign(user, updateUserAdminDto);
    await this.userRepository.save(user);

    return user;
  }

  async deleteUserById(id: string): Promise<void> {
    const user = await this.getUserById(id);
    await this.userRepository.remove(user);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      throw new NotFoundException(
        ErrorMessages.USER_NOT_FOUND_ID.message.replace('{id}', id),
      );
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      throw new NotFoundException(
        ErrorMessages.USER_NOT_FOUND_EMAIL.message.replace('{email}', email),
      );
    }

    return user;
  }

  async isUserExistsByEmail(email: string): Promise<boolean> {
    const userCount = await this.userRepository.count({
      where: { email },
    });
    return userCount > 0;
  }

  async updateUserRefreshToken(
    refreshToken: string,
    email: string,
  ): Promise<void> {
    const user = await this.findOneByEmail(email);
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);
  }

  async findUserByIdAndRefreshToken(
    id: string,
    refreshToken: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
        refreshToken,
      },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      throw new NotFoundException(
        ErrorMessages.USER_NOT_EXISTED_OR_REFRESH_TOKEN_INVALID.message.replace(
          '{id}',
          id,
        ),
      );
    }

    return user;
  }
}
