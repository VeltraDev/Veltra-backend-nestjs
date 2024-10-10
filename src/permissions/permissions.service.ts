import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Permission } from './entities/permission.entity';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePermissionDto } from './dto/request/create-permission.dto';
import { UpdatePermissionDto } from './dto/request/update-permission.dto';
import { FilterPermissionsDto } from './dto/request/filter-permission.dto';
import { BaseService } from 'src/base/base.service';

@Injectable()
export class PermissionsService extends BaseService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super(permissionRepository);
  }

  private async checkPermissionExists(
    apiPath: string,
    method: string,
    module: string,
    excludeId?: string,
  ): Promise<void> {
    const existingPermission = await this.permissionRepository.findOne({
      where: { apiPath, method },
    });

    if (
      existingPermission &&
      (!excludeId || existingPermission.id !== excludeId)
    ) {
      const methodAndPath = `${method} ${apiPath}`;
      throw new ConflictException(
        ErrorMessages.PERMISSION_SAME_API_MODULE.replace(
          '{methodAndPath}',
          methodAndPath,
        ).replace('{module}', module),
      );
    }
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const { apiPath, method, module } = createPermissionDto;

    const moduleValue = module || 'unknown module';
    await this.checkPermissionExists(apiPath, method, moduleValue);

    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async getAllPermissions(query: FilterPermissionsDto) {
    const validSortFields = [
      'name',
      'apiPath',
      'method',
      'module',
      'createdAt',
    ];

    return this.getAll(query, validSortFields, 'permission');
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(
        ErrorMessages.PERMISSION_NOT_FOUND.replace('{id}', id),
      );
    }
    return permission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const { apiPath, method, module } = updatePermissionDto;

    const permission = await this.findOne(id);

    if (apiPath && method) {
      const moduleValue = module || permission.module || 'unknown module';
      await this.checkPermissionExists(apiPath, method, moduleValue, id);
    }

    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }
}
