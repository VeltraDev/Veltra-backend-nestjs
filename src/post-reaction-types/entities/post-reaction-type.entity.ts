import { EntityBase } from 'src/base/entities/base.entity';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PostReactionType extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;
}
