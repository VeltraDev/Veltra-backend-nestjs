import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { UsersModule } from 'src/users/users.module';
import { DatabasesController } from './databases.controller';
import { DatabasesService } from './databases.service';
import { User } from 'src/users/entities/user.entity';
import { ReactionType } from 'src/reaction-types/entities/reaction-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, ReactionType]),
    UsersModule,
  ],
  controllers: [DatabasesController],
  providers: [DatabasesService],
})
export class DatabasesModule {}
