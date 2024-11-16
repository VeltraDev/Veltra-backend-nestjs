import { EntityBase } from 'src/base/entities/base.entity';
import { CommentReactionRecord } from 'src/comment-reactions/entities/comment-reaction-record.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('reaction_types')
export class ReactionType extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  type: string;

  @OneToMany(() => CommentReactionRecord, (reaction) => reaction.reactionType)
  commentReactions: CommentReactionRecord[];
}
