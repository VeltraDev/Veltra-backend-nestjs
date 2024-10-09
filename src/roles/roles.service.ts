import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/request/create-role.dto';
import { UpdateRoleDto } from './dto/request/update-role.dto';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilterRolesDto } from './dto/request/filter-role.dto';
import { Permission } from 'src/permissions/entities/permission.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async checkRoleExists(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const query = this.roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) = LOWER(:name)', { name });

    if (excludeId) {
      query.andWhere('role.id != :id', { id: excludeId });
    }

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

  private async validatePermissionsAndUsers(
    permissions?: string[],
    users?: string[],
  ): Promise<void> {
    if (permissions) {
      await this.validateEntityExistence(
        permissions,
        this.permissionRepository,
        ErrorMessages.PERMISSION_NOT_FOUND,
      );
    }

    if (users) {
      await this.validateEntityExistence(
        users,
        this.userRepository,
        ErrorMessages.USER_NOT_FOUND_ID,
      );
    }
  }

  private async assignPermissionsAndUsersToRole(
    role: Role,
    permissions?: string[],
    users?: string[],
  ): Promise<Role> {
    if (permissions) {
      role.permissions = await this.permissionRepository.find({
        where: permissions.map((id) => ({ id })),
      });
    }

    if (users) {
      role.users = await this.userRepository.find({
        where: users.map((id) => ({ id })),
      });
    }

    return role;
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const {
      name,
      description,
      isActive = true,
      permissions,
      users,
    } = createRoleDto;

    const lowercaseName = name.toLowerCase();

    await this.checkRoleExists(lowercaseName);
    await this.validatePermissionsAndUsers(permissions, users);

    let role = this.roleRepository.create({
      name,
      description,
      isActive,
    });

    role = await this.assignPermissionsAndUsersToRole(role, permissions, users);

    return this.roleRepository.save(role);
  }

  async getAllRoles(
    query: FilterRolesDto,
  ): Promise<{ total: number; page: number; limit: number; results: Role[] }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'ASC',
      name,
      description,
      isActive = true,
      createdAt,
    } = query;

    const validSortFields = ['name', 'description', 'isActive', 'createdAt'];
    if (!validSortFields.includes(sortBy)) {
      throw new BadRequestException(ErrorMessages.SORT_BY_INVALID);
    }

    const orderUpperCase = order.toUpperCase();
    if (!['ASC', 'DESC'].includes(orderUpperCase)) {
      throw new BadRequestException(ErrorMessages.ORDER_INVALID);
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('role.users', 'users');

    if (name) {
      queryBuilder.andWhere('LOWER(role.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }

    if (description) {
      queryBuilder.andWhere(
        'LOWER(role.description) LIKE LOWER(:description)',
        {
          description: `%${description}%`,
        },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('role.isActive = :isActive', { isActive });
    }

    if (createdAt) {
      queryBuilder.andWhere('DATE(role.createdAt) = :createdAt', { createdAt });
    }

    queryBuilder
      .orderBy(`role.${sortBy}`, orderUpperCase as 'ASC' | 'DESC')
      .skip(skip)
      .take(limit);

    const [roles, total] = await queryBuilder.getManyAndCount();

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      results: roles,
    };
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, isActive: true },
      relations: ['permissions', 'users'],
    });
    if (!role) {
      throw new NotFoundException(
        ErrorMessages.ROLE_NOT_FOUND.replace('{id}', id),
      );
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { name, permissions, users, isActive } = updateRoleDto;

    const role = await this.findOne(id);

    if (name) {
      const lowercaseName = name.toLowerCase();
      await this.checkRoleExists(lowercaseName, id);
      role.name = lowercaseName;
    }

    if (isActive !== undefined) {
      role.isActive = isActive;
    }

    await this.validatePermissionsAndUsers(permissions, users);
    await this.assignPermissionsAndUsersToRole(role, permissions, users);

    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    role.isActive = false;

    try {
      await this.roleRepository.save(role);
    } catch (error) {
      throw new InternalServerErrorException(
        'Không thể vô hiệu hóa vai trò do lỗi hệ thống',
      );
    }
  }
}
