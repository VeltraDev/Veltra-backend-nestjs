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
import { FilterPermissionsDto } from './dto/request/filter-permission.dto';
import { ErrorMessages } from 'src/exception/error-messages.enum';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @MessageResponse('Tạo mới quyền hạn thành công')
  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission =
      await this.permissionsService.create(createPermissionDto);

    return plainToClass(PermissionResponseDto, permission, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse(
    'Lấy thông tin tất cả quyền hạn với điều kiện truy vấn thành công',
  )
  @Get()
  async getAllPermissions(@Query() query: FilterPermissionsDto) {
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
    const permission = await this.permissionsService.findOne(id);

    return plainToClass(PermissionResponseDto, permission, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Cập nhật thông tin quyền hạn thành công')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionsService.update(
      id,
      updatePermissionDto,
    );

    return plainToClass(PermissionResponseDto, permission, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Xóa thông tin quyền hạn thành công')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.permissionsService.remove(id);
  }
}
