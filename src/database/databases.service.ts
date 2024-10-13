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
  INIT_PERMISSIONS,
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

  async onModuleInit() {
    const isInit = this.configService.get<string>('SHOULD_INIT');
    if (Boolean(isInit)) {
      const countUser = await this.userRepository.count();
      const countPermission = await this.permissionRepository.count();
      const countRole = await this.roleRepository.count();

      if (countPermission === 0) {
        for (const permission of INIT_PERMISSIONS) {
          const newPermission = this.permissionRepository.create(
            permission as unknown as DeepPartial<Permission>,
          );
          await this.permissionRepository.save(newPermission);
        }
      }

      if (countRole === 0) {
        const permissions = await this.permissionRepository.find();
        await this.roleRepository.save([
          this.roleRepository.create({
            name: ADMIN_ROLE,
            description: 'Admin toàn quyền sử dụng hệ thống',
            isActive: true,
            permissions: permissions,
            ...commonTimestamps(),
          }),
          this.roleRepository.create({
            name: USER_ROLE,
            description:
              'Người dùng có thể sử dụng hệ thống tùy theo quyền hạn phù hợp theo vai trò',
            isActive: true,
            permissions: [],
            ...commonTimestamps(),
          }),
        ]);
      }

      if (countUser === 0) {
        const adminRole = await this.roleRepository.findOne({
          where: { name: ADMIN_ROLE },
        });
        const userRole = await this.roleRepository.findOne({
          where: { name: USER_ROLE },
        });

        await this.userRepository.save([
          this.userRepository.create({
            firstName: 'Veltra',
            lastName: 'Admin',
            email: 'veltra.admin@gmail.com',
            password: getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            role: adminRole,
            isVerified: true,
            ...commonTimestamps(),
          }),
          this.userRepository.create({
            firstName: 'Veltra',
            lastName: 'User',
            email: 'veltra.user@gmail.com',
            password: getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            role: userRole,
            isVerified: true,
            ...commonTimestamps(),
          }),
          this.userRepository.create({
            firstName: 'Quách Phú',
            lastName: 'Thuận',
            email: 'thuanmobile1111@gmail.com',
            password: getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            role: adminRole,
            isVerified: true,
            ...commonTimestamps(),
          }),
        ]);
      }

      if (countUser > 0 && countRole > 0 && countPermission > 0) {
        this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
      }
    }
  }
}
