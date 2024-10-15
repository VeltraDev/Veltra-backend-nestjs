import { Conversation } from 'src/conversations/entities/conversation.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('user_conversations')
export class UserConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: string;

  @CreateDateColumn()
  addedAt: Date;

  @ManyToOne(() => User, (user) => user.userConversations)
  user: User;

  @ManyToOne(
    () => Conversation,
    (conversation) => conversation.userConversations,
  )
  conversation: Conversation;
}
