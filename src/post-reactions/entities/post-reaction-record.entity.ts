import { EntityBase } from 'src/base/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { ReactionType } from 'src/reaction-types/entities/reaction-type.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('post_reactions_records')
@Unique(['reactedBy', 'post'])
export class PostReactionRecord extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, (post) => post.reactions)
  post: Post;

  @ManyToOne(() => ReactionType, (reactionType) => reactionType.postReactions)
  reactionType: ReactionType;

  @ManyToOne(() => User, (user) => user.postReactionsGiven)
  reactedBy: User;
}
