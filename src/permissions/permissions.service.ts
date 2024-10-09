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
import { GetPermissionsDto } from './dto/request/get-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

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

  async getAllPermissions(query: GetPermissionsDto): Promise<{
    total: number;
    page: number;
    limit: number;
    results: Permission[];
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'ASC',
      name,
      apiPath,
      method,
      module,
      createdAt,
    } = query;

    // Validate sortBy field
    const validSortFields = [
      'name',
      'apiPath',
      'method',
      'module',
      'createdAt',
    ];
    if (!validSortFields.includes(sortBy)) {
      throw new BadRequestException(ErrorMessages.SORT_BY_INVALID);
    }

    // Normalize order to uppercase
    const orderUpperCase = order.toUpperCase();
    if (!['ASC', 'DESC'].includes(orderUpperCase)) {
      throw new BadRequestException(ErrorMessages.ORDER_INVALID);
    }

    const skip = (page - 1) * limit;

    const queryBuilder =
      this.permissionRepository.createQueryBuilder('permission');

    // Field-specific filters
    if (name) {
      queryBuilder.andWhere('LOWER(permission.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }

    if (apiPath) {
      queryBuilder.andWhere('permission.apiPath LIKE :apiPath', {
        apiPath: `%${apiPath}%`,
      });
    }

    if (method) {
      queryBuilder.andWhere('LOWER(permission.method) = LOWER(:method)', {
        method,
      });
    }

    if (module) {
      queryBuilder.andWhere('LOWER(permission.module) LIKE LOWER(:module)', {
        module: `%${module}%`,
      });
    }

    if (createdAt) {
      queryBuilder.andWhere('permission.createdAt = :createdAt', { createdAt });
    }

    // Sort and pagination
    queryBuilder
      .orderBy(`permission.${sortBy}`, orderUpperCase as 'ASC' | 'DESC')
      .skip(skip)
      .take(limit);

    const [permissions, total] = await queryBuilder.getManyAndCount();

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      results: permissions,
    };
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
