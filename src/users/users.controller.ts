import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Put,
  Query,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { MessageResponse } from '../common/decorators/message-response.decorator';
import { UsersInterface } from './users.interface';
import { UpdateProfilePasswordDto } from './dto/request/update-password.dto';
import { UpdateProfileInformationDto } from './dto/request/update-profile.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { plainToClass } from 'class-transformer';
import { FilterUsersDto } from './dto/request/filter-user.dto';
import { UpdateUserAdminDto } from './dto/request/update-user-admin.dto';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { PaginatedUsersDto } from './dto/response/paginate-user-response.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessageResponse('Cập nhật mật khẩu mới thành công')
  @Put('update-password')
  async updatePassword(
    @AuthUser() user: UsersInterface,
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
    @AuthUser() user: UsersInterface,
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
  async getUserById(@AuthUser() user: UsersInterface, @Param('id') id: string) {
    const userInfo = await this.usersService.getUserById(id);
    return plainToClass(UserResponseDto, userInfo, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse(
    'Lấy thông tin tất cả người dùng với điều kiện truy vấn thành công',
  )
  @Get()
  async getAllUsers(@Query() query: FilterUsersDto) {
    try {
      const paginatedUsers = await this.usersService.getAllUsers(query);

      return plainToClass(PaginatedUsersDto, {
        total: paginatedUsers.total,
        page: paginatedUsers.page,
        limit: paginatedUsers.limit,
        results: paginatedUsers.results.map((user) =>
          plainToClass(UserResponseDto, user, {
            excludeExtraneousValues: true,
          }),
        ),
      });
    } catch (error) {
      throw new InternalServerErrorException(ErrorMessages.FETCH_USERS_FAILED);
    }
  }

  @MessageResponse('Cập nhật thông tin người dùng thành công')
  @Patch(':id')
  async updateUserById(
    @AuthUser() user: UsersInterface,
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
    @AuthUser() user: UsersInterface,
    @Param('id') id: string,
  ): Promise<void> {
    await this.usersService.deleteUserById(id);
  }
}
