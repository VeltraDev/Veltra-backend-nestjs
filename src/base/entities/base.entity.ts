import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  BeforeRemove,
} from 'typeorm';

export abstract class EntityBase {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'json', nullable: true })
  createdBy: { id: string; email: string };

  @Column({ type: 'json', nullable: true })
  updatedBy: { id: string; email: string };

  @BeforeInsert()
  setCreated() {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  setUpdated() {
    this.updatedAt = new Date();
  }
}
