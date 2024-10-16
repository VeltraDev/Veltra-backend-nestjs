import { EntityBase } from 'src/base/entities/base.entity';
import { Message } from 'src/messages/entities/message.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
} from 'typeorm';

@Entity()
export class Conversation extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'New Conversation' })
  name: string;

  @Column({ nullable: true, default: null })
  picture: string;

  @Column({ default: false })
  isGroup: boolean;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @ManyToMany(() => User, (user) => user.conversations)
  users: User[];

  @ManyToOne(() => User, { nullable: true, eager: true })
  admin: User;

  @ManyToOne(() => Message, { nullable: true, eager: true })
  latestMessage: Message;
}
