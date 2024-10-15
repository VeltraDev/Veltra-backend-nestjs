import { EntityBase } from 'src/base/entities/base.entity';
import { Message } from 'src/messages/entities/message.entity';
import { UserConversation } from 'src/user-conversations/entities/user-conversation.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Conversation extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  picture: string;

  @Column()
  isGroup: boolean;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @OneToMany(
    () => UserConversation,
    (userConversation) => userConversation.conversation,
  )
  userConversations: UserConversation[];
}
