import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/request/create-role.dto';
import { UpdateRoleDto } from './dto/request/update-role.dto';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FilterRolesDto } from './dto/request/filter-role.dto';
import { Permission } from 'src/permissions/entities/permission.entity';
import { BaseService } from 'src/base/base.service';
import { UsersInterface } from 'src/users/users.interface';

@Injectable()
export class RolesService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super(roleRepository);
  }

  private async checkRoleExists(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const query = this.roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) = LOWER(:name)', { name });

    if (excludeId) query.andWhere('role.id != :id', { id: excludeId });

    const role = await query.getOne();
    if (role) {
      throw new BadRequestException(
        ErrorMessages.ROLE_ALREADY_EXISTS.replace('{name}', name),
      );
    }
  }

  private async validateEntityExistence(
    ids: string[],
    repository: Repository<any>,
    errorMessage: string,
  ): Promise<void> {
    const existingEntities = await repository.find({
      where: ids.map((id) => ({ id })),
    });

    if (existingEntities.length !== ids.length) {
      const missingIds = ids.filter(
        (id) => !existingEntities.some((entity) => entity.id === id),
      );
      throw new NotFoundException(
        errorMessage.replace('{id}', missingIds.join(', ')),
      );
    }
  }

  private async validatePermission(permissions?: string[]): Promise<void> {
    if (permissions) {
      await this.validateEntityExistence(
        permissions,
        this.permissionRepository,
        ErrorMessages.PERMISSION_NOT_FOUND,
      );
    }
  }

  private async assignPermissionsToRole(
    role: Role,
    permissions?: string[],
  ): Promise<Role> {
    if (permissions) {
      role.permissions = await this.permissionRepository.find({
        where: permissions.map((id) => ({ id })),
      });
    }

    return role;
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description, isActive = true, permissions } = createRoleDto;

    const lowercaseName = name.toLowerCase();

    await this.checkRoleExists(lowercaseName);
    await this.validatePermission(permissions);

    const permissionEntities = await this.permissionRepository.find({
      where: {
        id: In(permissions),
      },
    });

    let role = this.roleRepository.create({
      name,
      description,
      isActive,
      permissions: permissionEntities,
    });

    role = await this.assignPermissionsToRole(role, permissions);

    return this.roleRepository.save(role);
  }

  async getAllRoles(query: FilterRolesDto) {
    const validSortFields = ['name', 'description', 'isActive', 'createdAt'];

    return this.getAll(query, validSortFields, 'role', ['permissions']);
  }

  async getRoleById(id: string, includeInactive = false): Promise<Role> {
    const whereCondition = includeInactive ? { id } : { id, isActive: true };
    const role = await this.roleRepository.findOne({
      where: whereCondition,
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException(
        ErrorMessages.ROLE_ID_NOT_FOUND.replace('{id}', id),
      );
    }
    return role;
  }

  async getRoleByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name, isActive: true },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException(
        ErrorMessages.ROLE_NAME_NOT_FOUND.replace('{name}', name),
      );
    }
    return role;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { name, permissions, isActive, description } = updateRoleDto;

    const role = await this.getRoleById(id, true);

    if (name) {
      const lowercaseName = name.toLowerCase();
      await this.checkRoleExists(lowercaseName, id);
      role.name = lowercaseName;
    }

    if (description !== undefined) role.description = description;

    if (isActive !== undefined) role.isActive = isActive;

    if (permissions && permissions.length > 0) {
      await this.validatePermission(permissions);

      const existingPermissionIds = role.permissions.map((perm) => perm.id);
      const combinedPermissionIds = Array.from(
        new Set([...existingPermissionIds, ...permissions]),
      );

      role.permissions = await this.permissionRepository.find({
        where: { id: In(combinedPermissionIds) },
      });
    }

    return this.roleRepository.save(role);
  }

  async deactivateRole(id: string): Promise<void> {
    const role = await this.getRoleById(id);

    role.isActive = false;

    try {
      await this.roleRepository.save(role);
    } catch (error) {
      throw new InternalServerErrorException(ErrorMessages.NOT_DISABLE_ROLE);
    }
  }

  async removePermissionsFromRole(
    roleId: string,
    permissions: string[],
  ): Promise<Role> {
    const role = await this.getRoleById(roleId, true);

    const invalidPermissions = permissions.filter(
      (permission) => !role.permissions.some((perm) => perm.id === permission),
    );

    if (invalidPermissions.length > 0) {
      const errorMessage = ErrorMessages.PERMISSION_NOT_FOUND_IN_ROLE.replace(
        '{permission}',
        invalidPermissions.join(', '),
      ).replace('{role}', role.name);

      throw new NotFoundException(errorMessage);
    }

    role.permissions = role.permissions.filter(
      (perm) => !permissions.includes(perm.id),
    );

    return this.roleRepository.save(role);
  }
}
