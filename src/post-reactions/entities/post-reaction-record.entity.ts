import { EntityBase } from 'src/base/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';
import { ReactionType } from 'src/reaction-types/entities/reaction-type.entity';

@Entity('post_reactions_records')
@Unique(['user', 'post'])
export class PostReactionRecord extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.postReactions, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Post, (post) => post.postReactions, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => ReactionType)
  reactionType: ReactionType;
}
