import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { EntityBase } from 'src/base/entities/base.entity';

@Entity()
export class MessageForward extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  forwardedBy: User;

  @ManyToOne(() => Message, { nullable: false })
  originalMessage: Message;

  @ManyToOne(() => Conversation, { nullable: false })
  targetConversation: Conversation;
}
