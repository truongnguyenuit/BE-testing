import { UpdatePostInput } from "../types/UpdatePostInput";
import { Post } from "../entities/Post";
import { createPostInput } from "../types/CreatePostInput";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { Arg, ID, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { checkAuth } from "../middleware/checkAuth";

@Resolver()
export class PostResolver {
  @Mutation((_return) => PostMutationResponse, { nullable: true })
  async createPost(
    @Arg("postInput") { title, text }: createPostInput
  ): Promise<PostMutationResponse> {
    try {
      const newPost = Post.create({
        title,
        text,
      });
      await newPost.save();
      return {
        code: 200,
        success: true,
        message: "Post created successfully",
        post: newPost,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Query((_return) => [Post], { nullable: true })
  async posts(): Promise<Post[] | null> {
    try {
      return Post.find();
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }

  @Query((_return) => Post, { nullable: true })
  async post(@Arg("id", (_type) => ID) id: number): Promise<Post | null> {
    try {
      const post = await Post.findOne({ where: { id: id } });
      return post;
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }

  @Mutation((_return) => PostMutationResponse)
  async updatePost(
    @Arg("updatePostInput") { id, title, text }: UpdatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({ where: { id: id } });
      if (!existingPost) {
        return {
          code: 404,
          success: false,
          message: "post is not existing",
        };
      }

      existingPost.title = title;
      existingPost.text = text;
      await existingPost.save();

      return {
        code: 200,
        success: true,
        message: "post update successful",
        post: existingPost,
      };
    } catch (error) {
      console.log(error.message);
      return {
        code: 500,
        success: false,
        message: "Internal server error",
      };
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(
    @Arg("id", (_type) => ID) id: number
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({ where: { id: id } });
      if (!existingPost) {
        return {
          code: 404,
          success: false,
          message: "post is not existing",
        };
      }

      await existingPost.remove();
      return {
        code: 200,
        success: true,
        message: 'delete post successfully'
      }
    } catch (error) {
      console.log(error.message)
      return {
        code: 500,
        success: false, 
        message: "Internal server error"
      }
    }
    
  }
}
