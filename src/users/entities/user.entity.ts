import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { EntityBase } from '../../base/entities/base.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true, unique: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  displayStatus: string;

  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  otpCode: string;

  @Column({ nullable: true })
  otpExpiration: Date;

  @Column({ default: false })
  isVerified: boolean;
}
