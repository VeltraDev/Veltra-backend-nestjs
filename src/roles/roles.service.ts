import {
  BadRequestException,
  Injectable,
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
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RolesService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
        ErrorMessages.ROLE_ALREADY_EXISTS.message.replace('{name}', name),
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
        ErrorMessages.PERMISSION_NOT_FOUND.message,
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
    const { name, description, permissions } = createRoleDto;

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
      permissions: permissionEntities,
    });

    role = await this.assignPermissionsToRole(role, permissions);

    return this.roleRepository.save(role);
  }

  async getAllRoles(query: FilterRolesDto) {
    const validSortFields = ['name', 'description', 'createdAt'];

    return this.getAll(query, validSortFields, 'role', ['permissions']);
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(
        ErrorMessages.ROLE_ID_NOT_FOUND.message.replace('{id}', id),
      );
    }

    return role;
  }

  async getRoleByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException(
        ErrorMessages.ROLE_NAME_NOT_FOUND.message.replace('{name}', name),
      );
    }
    return role;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { name, permissions, description } = updateRoleDto;

    const role = await this.getRoleById(id);

    if (name) {
      const lowercaseName = name.toLowerCase();
      await this.checkRoleExists(lowercaseName, id);
      role.name = lowercaseName;
    }

    if (description !== undefined) role.description = description;

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

  async deleteRole(id: string): Promise<void> {
    const role = await this.getRoleById(id);

    if (role.name === 'USER' || role.name === 'ADMIN')
      throw new BadRequestException(
        ErrorMessages.NOT_DELETE_USER_ADMIN_ROLE.message,
      );

    const userRole = await this.roleRepository.findOne({
      where: { name: 'USER' },
    });
    if (!userRole) {
      throw new NotFoundException(
        ErrorMessages.ROLE_NAME_NOT_FOUND.message.replace(
          '{name}',
          userRole.name,
        ),
      );
    }

    const usersWithRole = await this.userRepository.find({
      where: { role: { id: role.id } },
      relations: ['role'],
    });

    for (const user of usersWithRole) {
      user.role = userRole;
      await this.userRepository.save(user);
    }

    await this.roleRepository
      .createQueryBuilder()
      .relation(Role, 'permissions')
      .of(role)
      .remove(role.permissions);

    await this.roleRepository.remove(role);
  }

  async removePermissionsFromRole(
    roleId: string,
    permissions: string[],
  ): Promise<Role> {
    const role = await this.getRoleById(roleId);

    const invalidPermissions = permissions.filter(
      (permission) => !role.permissions.some((perm) => perm.id === permission),
    );

    if (invalidPermissions.length > 0) {
      const errorMessage = ErrorMessages.PERMISSION_NOT_FOUND_IN_ROLE.message
        .replace('{permission}', invalidPermissions.join(', '))
        .replace('{role}', role.name);

      throw new NotFoundException(errorMessage);
    }

    role.permissions = role.permissions.filter(
      (perm) => !permissions.includes(perm.id),
    );

    return this.roleRepository.save(role);
  }
}
