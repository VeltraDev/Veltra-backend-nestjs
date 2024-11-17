import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { EntityBase } from 'src/base/entities/base.entity';
import { ReactionType } from 'src/reaction-types/entities/reaction-type.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
@Unique(['reactedBy', 'comment'])
export class CommentReactionRecord extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Comment, (comment) => comment.reactions)
  comment: Comment;

  @ManyToOne(
    () => ReactionType,
    (reactionType) => reactionType.commentReactions,
  )
  reactionType: ReactionType;

  @ManyToOne(() => User, (user) => user.commentReactionsGiven)
  reactedBy: User;
}
