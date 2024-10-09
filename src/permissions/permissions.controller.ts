import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { MessageResponse } from 'src/common/decorators/message_response.decorator';

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
  async findAll() {
    return await this.permissionsService.findAll();
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
