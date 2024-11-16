import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { EntityBase } from '../../base/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';
import { CommentReactionRecord } from 'src/comment-reactions/entities/comment-reaction-record.entity';

@Entity()
@Tree('closure-table')
export class Comment extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'mediumtext' })
  content: string;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { nullable: true })
  post: Post;

  @TreeParent()
  parent: Comment;

  @TreeChildren()
  children: Comment[];

  @OneToMany(() => CommentReactionRecord, (reaction) => reaction.comment)
  commentReactions: CommentReactionRecord[];
}
