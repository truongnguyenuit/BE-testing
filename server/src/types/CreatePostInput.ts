import { Field, InputType } from "type-graphql";

@InputType()
export class createPostInput{
  @Field()
  title: string;

  @Field()
  text: string;
}