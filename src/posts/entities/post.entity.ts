import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { EntityBase } from '../../base/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { PostReactionRecord } from 'src/post-reactions/entities/post-reaction-record.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Entity()
export class Post extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'mediumtext', nullable: true })
  content: string;

  @Column({ type: 'json', nullable: true })
  attachments: { url: string; type?: string }[];

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @OneToMany(() => PostReactionRecord, (reactionRecord) => reactionRecord.post)
  postReactions: PostReactionRecord[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
