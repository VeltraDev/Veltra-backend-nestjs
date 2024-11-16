import { EntityBase } from 'src/base/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('reaction_types')
export class ReactionType extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  type: string;
}
