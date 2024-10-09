import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { MessageResponse } from 'src/common/decorators/message_response.decorator';
import { CreatePermissionDto } from './dto/request/create-permission.dto';
import { UpdatePermissionDto } from './dto/request/update-permission.dto';
import { plainToClass } from 'class-transformer';
import { PaginatedPermissionsDto } from './dto/response/paginate-permission-response.dto';
import { PermissionResponseDto } from './dto/response/permission-response.dto';
import { GetPermissionsDto } from './dto/request/get-permission.dto';
import { ErrorMessages } from 'src/exception/error-messages.enum';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @MessageResponse('Tạo mới quyền hạn thành công')
  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.permissionsService.create(createPermissionDto);
  }

  @MessageResponse(
    'Lấy thông tin tất cả quyền hạn với điều kiện truy vấn thành công',
  )
  @Get()
  async getAllPermissions(@Query() query: GetPermissionsDto) {
    try {
      const paginatedPermissions =
        await this.permissionsService.getAllPermissions(query);

      const results = paginatedPermissions.results.map((permission) =>
        plainToClass(PermissionResponseDto, permission, {
          excludeExtraneousValues: true,
        }),
      );

      return plainToClass(PaginatedPermissionsDto, {
        total: paginatedPermissions.total,
        page: paginatedPermissions.page,
        limit: paginatedPermissions.limit,
        results,
      });
    } catch (error) {
      throw new InternalServerErrorException(ErrorMessages.FETCH_USERS_FAILED);
    }
  }

  @MessageResponse('Lấy thông tin quyền hạn thành công')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.permissionsService.findOne(id);
  }

  @MessageResponse('Cập nhật thông tin quyền hạn thành công')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return await this.permissionsService.update(id, updatePermissionDto);
  }

  @MessageResponse('Xóa thông tin quyền hạn thành công')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.permissionsService.remove(id);
  }
}
