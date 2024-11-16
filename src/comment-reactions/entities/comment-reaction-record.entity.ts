import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { EntityBase } from 'src/base/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { ReactionType } from 'src/reaction-types/entities/reaction-type.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Entity()
export class CommentReactionRecord extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.commentReactions)
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.commentReactions)
  comment: Comment;

  @ManyToOne(
    () => ReactionType,
    (reactionType) => reactionType.commentReactions,
  )
  reactionType: ReactionType;
}
