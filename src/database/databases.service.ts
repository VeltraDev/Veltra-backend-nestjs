import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import {
  ADMIN_ROLE,
  commonTimestamps,
  INIT_ADMIN_PERMISSIONS,
  INIT_USER_LOGIN_PERMISSIONS,
  USER_ROLE,
} from './sample';
import { getHashPassword } from 'src/common/utils/hashPassword';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) {}

  private async createOrGetPermissions(
    permissionsArray: any[],
  ): Promise<Permission[]> {
    const createdPermissions: Permission[] = [];

    for (const permission of permissionsArray) {
      let existingPermission = await this.permissionRepository.findOne({
        where: { name: permission.name, apiPath: permission.apiPath },
      });

      if (!existingPermission) {
        existingPermission = this.permissionRepository.create(
          permission as unknown as DeepPartial<Permission>,
        );
        await this.permissionRepository.save(existingPermission);
      }

      createdPermissions.push(existingPermission);
    }

    return createdPermissions;
  }

  private async createRoles(
    adminPermissions: Permission[],
    userPermissions: Permission[],
  ) {
    await this.roleRepository.save([
      this.roleRepository.create({
        name: ADMIN_ROLE,
        description: 'Admin toàn quyền sử dụng hệ thống',
        permissions: adminPermissions,
        ...commonTimestamps(),
      }),
      this.roleRepository.create({
        name: USER_ROLE,
        description: 'Người dùng đăng nhập với quyền hạn cơ bản',
        permissions: userPermissions,
        ...commonTimestamps(),
      }),
    ]);
  }

  private async createUsers(adminRole: Role, userRole: Role) {
    const users = [
      {
        firstName: 'Veltra',
        lastName: 'Admin',
        email: 'veltra.admin@gmail.com',
        role: adminRole,
      },
      {
        firstName: 'Veltra',
        lastName: 'User',
        email: 'veltra.user@gmail.com',
        role: userRole,
      },
      {
        firstName: 'Quách Phú',
        lastName: 'Thuận',
        email: 'thuanmobile1111@gmail.com',
        role: adminRole,
      },
      {
        firstName: 'Thuận',
        lastName: 'Phú',
        email: '2251120446@ut.edu.vn',
        role: userRole,
      },
      {
        firstName: 'Lê Trần Hoàng',
        lastName: 'Kiên',
        email: 'thuyy566@gmail.com',
        role: adminRole,
      },
      {
        firstName: 'Trần Nguyễn Minh',
        lastName: 'Quân',
        email: 'tranquanmikaz@gmail.com',
        role: adminRole,
      },
      {
        firstName: 'Lê Phạm Thanh',
        lastName: 'Duy',
        email: 'tdmg1809@gmail.com',
        role: adminRole,
      },
    ];

    for (const userData of users) {
      await this.userRepository.save(
        this.userRepository.create({
          ...userData,
          password: getHashPassword(
            this.configService.get<string>('INIT_PASSWORD'),
          ),
          isVerified: true,
          ...commonTimestamps(),
        }),
      );
    }
  }

  async onModuleInit() {
    const isInit = this.configService.get<string>('SHOULD_INIT');
    if (Boolean(isInit)) {
      const countUser = await this.userRepository.count();
      const countPermission = await this.permissionRepository.count();
      const countRole = await this.roleRepository.count();

      if (countPermission === 0) {
        const adminPermissions = await this.createOrGetPermissions(
          INIT_ADMIN_PERMISSIONS,
        );
        const userLoginPermissions = await this.createOrGetPermissions(
          INIT_USER_LOGIN_PERMISSIONS,
        );

        if (countRole === 0) {
          await this.createRoles(adminPermissions, userLoginPermissions);
        }
      }

      if (countUser === 0) {
        const adminRole = await this.roleRepository.findOne({
          where: { name: ADMIN_ROLE },
        });
        const userRole = await this.roleRepository.findOne({
          where: { name: USER_ROLE },
        });
        await this.createUsers(adminRole, userRole);
      }

      if (countUser > 0 && countRole > 0 && countPermission > 0) {
        this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
      }
    }
  }
}
