import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDtoForAdmin } from './dto/request/update-user-admin.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (userExists) {
      throw new BadRequestException('Người dùng với email này đã tồn tại.');
    }

    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    return user;
  }

  async isUserExistsByEmail(email: string): Promise<boolean> {
    const userCount = await this.userRepository.count({
      where: { email },
    });

    return userCount > 0;
  }

  async update(id: string, updateUserDto: Partial<User>): Promise<void> {
    await this.userRepository.update(id, updateUserDto);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOneById(id);
    await this.userRepository.remove(user);
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
        `Người dùng với id ${id} không tồn tại hoặc refresh token không hợp lệ.`,
      );
    }

    return user;
  }
}
