import { Resolver, Query } from "type-graphql";

@Resolver()
export class HelloResolver {
  @Query(_return => String)
  hello() {
    return 'hello world'
  }
}