import { Field, ObjectType, ID } from "type-graphql";
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@ObjectType() // mark this class will return an grapql object
@Entity() // mark this class will compile to db table
export class User extends BaseEntity {
  @Field(_type => ID) // confirm type will be return in this field (graphql object)
  @PrimaryGeneratedColumn() // mark this field will compile to a column of table
  id!: number

  @Field()// not have type because auto detect string(typescript) => String(GraphQL)
  @Column({unique: true})
  username!: string

  @Field()
  @Column()
  email!: string

  @Column()
  password!: string

  @Field()// not have type because auto detect Date(typescript) => DateTime(GraphQL)
  @CreateDateColumn()
  createdAt: Date 

  @Field()
  @UpdateDateColumn()
  updatedAt: Date
}