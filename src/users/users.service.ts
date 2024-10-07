import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async updatePassword(
    user: UsersInterface,
    updateProfilePasswordDto: UpdateProfilePasswordDto,
  ): Promise<User> {
    const { currentPassword, newPassword, confirmPassword } =
      updateProfilePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new ForbiddenException(
        'Mật khẩu mới và xác nhận mật khẩu không khớp.',
      );
    }

    const foundUser = await this.getUserById(user.id);

    const validPassword = await isValidPassword(
      currentPassword,
      foundUser.password,
    );
    if (!validPassword)
      throw new ForbiddenException('Mật khẩu hiện tại không chính xác.');

    const isNewPasswordSameAsCurrent = await isValidPassword(
      newPassword,
      foundUser.password,
    );
    if (isNewPasswordSameAsCurrent)
      throw new ForbiddenException(
        'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
      );

    const hashedNewPassword = getHashPassword(newPassword);
    foundUser.password = hashedNewPassword;

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

  async create(registerUserDto: RegisterUserDto): Promise<User> {
    const emailExists = await this.isUserExistsByEmail(registerUserDto.email);
    if (emailExists)
      throw new BadRequestException(
        `Email ${registerUserDto.email} đã được sử dụng.`,
      );

    const phoneExists = await this.isUserExistsByPhone(registerUserDto.phone);
    if (phoneExists)
      throw new BadRequestException(
        `Số điện thoại ${registerUserDto.phone} đã được sử dụng.`,
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
      search,
      email,
      firstName,
      lastName,
      phone,
    } = query;

    const validSortFields = [
      'createdAt',
      'email',
      'firstName',
      'lastName',
      'phone',
    ];
    if (!validSortFields.includes(sortBy)) {
      throw new BadRequestException(
        `Trường sắp xếp không hợp lệ. Chỉ được phép sắp xếp theo: ${validSortFields.join(', ')}`,
      );
    }

    if (!['ASC', 'DESC'].includes(order.toUpperCase())) {
      throw new BadRequestException(
        "Thứ tự sắp xếp không hợp lệ. Chỉ được phép sử dụng 'ASC' hoặc 'DESC'.",
      );
    }

    if (page <= 0) throw new BadRequestException('Số trang phải lớn hơn 0.');
    if (limit <= 0)
      throw new BadRequestException('Giới hạn số lượng phải lớn hơn 0.');

    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder.where('user.isDeleted = :isDeleted', { isDeleted: false });

    if (search) {
      queryBuilder.andWhere(
        `(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.phone ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    if (firstName) {
      queryBuilder.andWhere('user.firstName ILIKE :firstName', {
        firstName: `%${firstName}%`,
      });
    }

    if (lastName) {
      queryBuilder.andWhere('user.lastName ILIKE :lastName', {
        lastName: `%${lastName}%`,
      });
    }

    if (phone) {
      queryBuilder.andWhere('user.phone ILIKE :phone', { phone: `%${phone}%` });
    }

    queryBuilder
      .orderBy(`user.${sortBy}`, order.toUpperCase() as 'ASC' | 'DESC')
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

    user.isDeleted = true;
    user.deletedAt = new Date();

    await this.userRepository.save(user);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException(`Người dùng với id ${id} không tồn tại.`);
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException(
        `Người dùng với email ${email} không tồn tại trên hệ thống.`,
      );
    }

    return user;
  }

  async findOneByPhone(phone: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { phone, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException(
        `Người dùng với số điện thoại ${phone} không tồn tại trên hệ thống.`,
      );
    }

    return user;
  }

  async isUserExistsByEmail(email: string): Promise<boolean> {
    const userCount = await this.userRepository.count({
      where: { email, isDeleted: false },
    });
    return userCount > 0;
  }

  async isUserExistsByPhone(phone: string): Promise<boolean> {
    const userCount = await this.userRepository.count({
      where: { phone, isDeleted: false },
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
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Người dùng với id ${id} không tồn tại hoặc refresh token không hợp lệ.`,
      );
    }

    return user;
  }
}
