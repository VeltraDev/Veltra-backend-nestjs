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
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/request/create-role.dto';
import { UpdateRoleDto } from './dto/request/update-role.dto';
import { RoleResponseDto } from './dto/response/role-response.dto';
import { PaginatedRolesDto } from './dto/response/paginate-role-response.dto';
import { plainToClass } from 'class-transformer';
import { MessageResponse } from 'src/common/decorators/message_response.decorator';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { GetRolesDto } from './dto/request/get-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @MessageResponse('Tạo vai trò mới thành công')
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.create(createRoleDto);

    return plainToClass(RoleResponseDto, role, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse(
    'Lấy thông tin tất cả vai trò với điều kiện truy vấn thành công',
  )
  @Get()
  async getAllRoles(@Query() query: GetRolesDto) {
    try {
      const paginatedRoles = await this.rolesService.getAllRoles(query);

      const results = paginatedRoles.results.map((role) =>
        plainToClass(RoleResponseDto, role, {
          excludeExtraneousValues: true,
        }),
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
  async findOne(@Param('id') id: string) {
    const role = await this.rolesService.findOne(id);

    return plainToClass(RoleResponseDto, role, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Cập nhật thông tin vai trò thành công')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const role = await this.rolesService.update(id, updateRoleDto);

    return plainToClass(RoleResponseDto, role, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Vô hiệu hóa vai trò thành công')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.rolesService.remove(id);
  }
}
