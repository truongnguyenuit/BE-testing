import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"; 

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  title!: string

  @Column()
  text!: string

  @CreateDateColumn()
  createAt: Date
  
  @UpdateDateColumn()
  updatedAt: Date
}