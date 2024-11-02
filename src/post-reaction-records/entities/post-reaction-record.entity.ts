import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';
import { PostReactionType } from 'src/post-reaction-types/entities/post-reaction-type.entity';
import { EntityBase } from 'src/base/entities/base.entity';

@Entity('post_reactions_records')
@Unique(['user', 'post'])
export class PostReactionRecord extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.postReactions)
  user: User;

  @ManyToOne(() => Post, (post) => post.postReactions)
  post: Post;

  @ManyToOne(() => PostReactionType)
  reactionType: PostReactionType;
}
