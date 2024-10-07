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

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'json', nullable: true })
  createdBy: { id: string; email: string };

  @Column({ type: 'json', nullable: true })
  updatedBy: { id: string; email: string };

  @Column({ type: 'json', nullable: true })
  deletedBy: { id: string; email: string };

  @BeforeInsert()
  setCreated() {
    this.createdAt = new Date();
    this.isDeleted = false;
  }

  @BeforeUpdate()
  setUpdated() {
    this.updatedAt = new Date();
  }

  @BeforeRemove()
  setDeleted() {
    this.deletedAt = new Date();
    this.isDeleted = true;
  }
}
