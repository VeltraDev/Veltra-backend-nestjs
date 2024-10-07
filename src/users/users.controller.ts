import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { MessageResponse } from '../common/decorators/message_response.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { UsersInterface } from './users.interface';
import { UpdateProfilePasswordDto } from './dto/request/update-password.dto';
import { UpdateProfileInformationDto } from './dto/request/update-profile.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { plainToClass } from 'class-transformer';
import { GetUsersDto } from './dto/request/get-user.dto';
import { UpdateUserAdminDto } from './dto/request/update-user-admin.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessageResponse('Cập nhật mật khẩu mới thành công')
  @Put('update-password')
  async updatePassword(
    @User() user: UsersInterface,
    @Body() updateProfilePasswordDto: UpdateProfilePasswordDto,
  ) {
    const userInfo = await this.usersService.updatePassword(
      user,
      updateProfilePasswordDto,
    );
    return plainToClass(UserResponseDto, userInfo, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Cập nhật thông tin người dùng thành công')
  @Patch('update-profile')
  async updateProfileInfo(
    @User() user: UsersInterface,
    @Body() updateProfileInformationDto: UpdateProfileInformationDto,
  ) {
    const userInfo = await this.usersService.updateProfileInfo(
      user,
      updateProfileInformationDto,
    );
    return plainToClass(UserResponseDto, userInfo, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Lấy thông tin người dùng thành công')
  @Get(':id')
  async getUserById(@User() user: UsersInterface, @Param('id') id: string) {
    const userInfo = await this.usersService.getUserById(id);
    return plainToClass(UserResponseDto, userInfo, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Lấy thông tin tất cả người dùng với điều kiện thành công')
  @Get()
  async getAllUsers(@User() user: UsersInterface, @Query() query: GetUsersDto) {
    const paginatedUsers = await this.usersService.getAllUsers(query);

    const results = paginatedUsers.results.map((user) =>
      plainToClass(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    );

    return {
      total: paginatedUsers.total,
      page: paginatedUsers.page,
      limit: paginatedUsers.limit,
      results,
    };
  }

  @MessageResponse('Cập nhật thông tin người dùng thành công')
  @Patch(':id')
  async updateUserById(
    @User() user: UsersInterface,
    @Param('id') id: string,
    @Body() updateUserAdminDto: UpdateUserAdminDto,
  ) {
    const userInfo = await this.usersService.updateUserById(
      id,
      updateUserAdminDto,
    );
    return plainToClass(UserResponseDto, userInfo, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Xóa tài khoản người dùng thành công')
  @Delete(':id')
  async deleteUserById(
    @User() user: UsersInterface,
    @Param('id') id: string,
  ): Promise<void> {
    await this.usersService.deleteUserById(id);
  }
}
