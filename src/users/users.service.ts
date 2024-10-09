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
import { RegisterUserDto } from 'src/auth/dto/request/register-user.dto';
import { GetUsersDto } from './dto/request/get-user.dto';
import { UpdateUserAdminDto } from './dto/request/update-user-admin.dto';
import { ErrorMessages } from 'src/exception/error-messages.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  private async validatePasswordMatch(
    currentPassword: string,
    foundUser: User,
  ) {
    const validPassword = await isValidPassword(
      currentPassword,
      foundUser.password,
    );
    if (!validPassword) {
      throw new BadRequestException(ErrorMessages.CURRENT_PASSWORD_INCORRECT);
    }
  }

  private async checkNewPassword(newPassword: string, foundUser: User) {
    const isNewPasswordSameAsCurrent = await isValidPassword(
      newPassword,
      foundUser.password,
    );
    if (isNewPasswordSameAsCurrent) {
      throw new BadRequestException(ErrorMessages.PASSWORD_SAME_AS_CURRENT);
    }
  }

  async updatePassword(
    user: UsersInterface,
    updateProfilePasswordDto: UpdateProfilePasswordDto,
  ): Promise<User> {
    const { currentPassword, newPassword, confirmPassword } =
      updateProfilePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(ErrorMessages.CONFIRM_PASSWORD_MATCH);
    }

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

  private async validateUserUniqueness(email: string, phone: string) {
    const [emailExists, phoneExists] = await Promise.all([
      this.isUserExistsByEmail(email),
      this.isUserExistsByPhone(phone),
    ]);

    if (emailExists) {
      throw new BadRequestException(
        ErrorMessages.EMAIL_ALREADY_USED.replace('{email}', email),
      );
    }

    if (phoneExists) {
      throw new BadRequestException(
        ErrorMessages.PHONE_ALREADY_USED.replace('{phone}', phone),
      );
    }
  }

  async create(registerUserDto: RegisterUserDto): Promise<User> {
    await this.validateUserUniqueness(
      registerUserDto.email,
      registerUserDto.phone,
    );
    const newUser = this.userRepository.create(registerUserDto);
    return await this.userRepository.save(newUser);
  }

  async update(id: string, updateUserDto: Partial<User>): Promise<void> {
    const user = await this.getUserById(id);
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);
  }

  async getAllUsers(query: GetUsersDto): Promise<{
    total: number;
    page: number;
    limit: number;
    results: User[];
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'ASC',
      firstName,
      lastName,
      phone,
      email,
      createdAt,
      displayStatus,
    } = query;

    // Validate sortBy field
    const validSortFields = [
      'createdAt',
      'email',
      'firstName',
      'lastName',
      'phone',
      'displayStatus',
    ];
    if (!validSortFields.includes(sortBy)) {
      throw new BadRequestException(ErrorMessages.SORT_BY_INVALID);
    }

    // Normalize order to uppercase
    const orderUpperCase = order.toUpperCase();
    if (!['ASC', 'DESC'].includes(orderUpperCase)) {
      throw new BadRequestException(ErrorMessages.ORDER_INVALID);
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Field-specific filters
    if (firstName) {
      queryBuilder.andWhere('LOWER(user.firstName) LIKE LOWER(:firstName)', {
        firstName: `%${firstName}%`,
      });
    }

    if (lastName) {
      queryBuilder.andWhere('LOWER(user.lastName) LIKE LOWER(:lastName)', {
        lastName: `%${lastName}%`,
      });
    }

    if (phone) {
      queryBuilder.andWhere('user.phone LIKE :phone', { phone: `%${phone}%` });
    }

    if (email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }

    if (createdAt) {
      queryBuilder.andWhere('user.createdAt = :createdAt', { createdAt });
    }

    if (displayStatus) {
      queryBuilder.andWhere(
        'LOWER(user.displayStatus) LIKE LOWER(:displayStatus)',
        {
          displayStatus: `%${displayStatus}%`,
        },
      );
    }

    // Sort and pagination
    queryBuilder
      .orderBy(`user.${sortBy}`, orderUpperCase as 'ASC' | 'DESC')
      .skip(skip)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      results: users,
    };
  }

  async updateUserById(
    id: string,
    updateUserAdminDto: UpdateUserAdminDto,
  ): Promise<User> {
    const user = await this.getUserById(id);

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
    });

    if (!user) {
      throw new NotFoundException(
        ErrorMessages.USER_NOT_FOUND_ID.replace('{id}', id),
      );
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(
        ErrorMessages.USER_NOT_FOUND_EMAIL.replace('{email}', email),
      );
    }

    return user;
  }

  async findOneByPhone(phone: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { phone },
    });

    if (!user) {
      throw new NotFoundException(
        ErrorMessages.USER_NOT_FOUND_PHONE.replace('{phone}', phone),
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

  async isUserExistsByPhone(phone: string): Promise<boolean> {
    const userCount = await this.userRepository.count({
      where: { phone },
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
    });

    if (!user) {
      throw new NotFoundException(
        ErrorMessages.USER_NOT_EXISTED_OR_REFRESH_TOKEN_INVALID.replace(
          '{id}',
          id,
        ),
      );
    }

    return user;
  }
}
