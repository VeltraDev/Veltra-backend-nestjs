import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { EntityBase } from '../../base/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';

@Entity()
export class Message extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'mediumtext' })
  content: string;

  @Column({ type: 'json', nullable: true })
  files: { url: string; type?: string }[];

  @ManyToOne(() => User, (user) => user.messages)
  sender: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;

  @ManyToOne(() => Message, { nullable: true })
  forwardedMessage: Message;
}
