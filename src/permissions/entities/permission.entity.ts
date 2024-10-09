import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { EntityBase } from '../../base/entities/base.entity';
import { Role } from 'src/roles/entities/role.entity';

@Entity()
export class Permission extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  apiPath: string;

  @Column()
  method: string;

  @Column()
  module: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[]
}
