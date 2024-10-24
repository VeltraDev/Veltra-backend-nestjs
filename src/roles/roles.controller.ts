import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  InternalServerErrorException,
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/request/create-role.dto';
import { UpdateRoleDto } from './dto/request/update-role.dto';
import { RoleResponseDto } from './dto/response/role-response.dto';
import { PaginatedRolesDto } from './dto/response/paginate-role-response.dto';
import { plainToClass } from 'class-transformer';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { FilterRolesDto } from './dto/request/filter-role.dto';
import { UpdatePermissionsToRoleDto } from './dto/request/update-permissions-role.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { RoleSecureResponseDto } from './dto/response/role-secure-response.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @MessageResponse('Tạo vai trò mới thành công')
  @Post()
  async createRole(@AuthUser() user, @Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.createRole(createRoleDto);

    return plainToClass(
      user.role.name === 'ADMIN' ? RoleResponseDto : RoleSecureResponseDto,
      role,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  @MessageResponse(
    'Lấy thông tin tất cả vai trò với điều kiện truy vấn thành công',
  )
  @Get()
  async getAllRoles(@AuthUser() user, @Query() query: FilterRolesDto) {
    try {
      const paginatedRoles = await this.rolesService.getAllRoles(query);

      const results = paginatedRoles.results.map((role) =>
        plainToClass(
          user.role.name === 'ADMIN' ? RoleResponseDto : RoleSecureResponseDto,
          role,
          {
            excludeExtraneousValues: true,
          },
        ),
      );

      return plainToClass(PaginatedRolesDto, {
        total: paginatedRoles.total,
        page: paginatedRoles.page,
        limit: paginatedRoles.limit,
        results,
      });
    } catch (error) {
      throw new InternalServerErrorException(ErrorMessages.FETCH_USERS_FAILED);
    }
  }

  @MessageResponse('Lấy thông tin vai trò thành công')
  @Get(':id')
  async getRoleById(@AuthUser() user, @Param('id') id: string) {
    const role = await this.rolesService.getRoleById(id);

    return plainToClass(
      user.role.name === 'ADMIN' ? RoleResponseDto : RoleSecureResponseDto,
      role,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  @MessageResponse('Cập nhật thông tin vai trò thành công')
  @Patch(':id')
  async updateRole(
    @AuthUser() user,
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.rolesService.updateRole(id, updateRoleDto);

    return plainToClass(
      user.role.name === 'ADMIN' ? RoleResponseDto : RoleSecureResponseDto,
      role,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  @MessageResponse('Xóa quyền hạn khỏi vai trò thành công')
  @Delete(':id/permissions')
  async removePermissions(
    @AuthUser() user,
    @Param('id') id: string,
    @Body() updatePermissionsDto: UpdatePermissionsToRoleDto,
  ) {
    const role = await this.rolesService.removePermissionsFromRole(
      id,
      updatePermissionsDto.permissions,
    );
    return plainToClass(
      user.role.name === 'ADMIN' ? RoleResponseDto : RoleSecureResponseDto,
      role,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  @MessageResponse('Vô hiệu hóa vai trò thành công')
  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    return await this.rolesService.deleteRole(id);
  }
}
