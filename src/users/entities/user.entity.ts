import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { EntityBase } from '../../base/entities/base.entity';
import { Exclude } from 'class-transformer';
import { Role } from 'src/roles/entities/role.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';

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

  @Column({ type: 'text', nullable: true })
  displayStatus: string;

  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  otpCode: string;

  @Column({ nullable: true })
  otpExpiration: Date;

  @Column({ default: 'basic' })
  provider: string;

  @Column({ nullable: true })
  providerUserId: string;

  @Column({ default: false })
  isVerified: boolean;

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @ManyToMany(() => Conversation, (conversation) => conversation.users)
  @JoinTable({
    name: 'user_conversations',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'conversationId', referencedColumnName: 'id' },
  })
  conversations: Conversation[];
}
