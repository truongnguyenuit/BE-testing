import { User } from "../entities/User";
import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { RegisterInput } from "../types/RegisterInput";
import { validateRegisterInput } from "../utils/validaterRegisterInput";
import { LoginInput } from "../types/LoginInput";
import { Context } from "src/types/Context";
import { COOKIE_NAME } from "../constants";
require("dotenv").config();
@Resolver()
export class UserResolver {
  @Mutation((_return) => UserMutationResponse, { nullable: true })
  async register(
    @Arg("registerInput") registerInput: RegisterInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    const validateRegisterInputErrors = validateRegisterInput(registerInput);

    if (validateRegisterInputErrors !== null)
      return { code: 400, success: false, ...validateRegisterInputErrors };

    try {
      const { username, email, password } = registerInput;
      const existingUser = await User.findOneBy({ username });

      if (existingUser)
        return {
          code: 400,
          success: false,
          message: "Duplicated username",
          errors: [
            {
              field: username,
              message: "Username of email already taken",
            },
          ],
        };

      const hashedPassword = await argon2.hash(password);

      const newUser = User.create({
        username,
        password: hashedPassword,
        email,
      });

      await newUser.save();

      req.session.userId = newUser.id;

      return {
        code: 200,
        success: true,
        message: "User registration successful",
        user: newUser,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg("loginInput") { usernameOrEmail, password }: LoginInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const existingUser = await User.findOneBy(
        usernameOrEmail.includes("@")
          ? { email: usernameOrEmail }
          : { username: usernameOrEmail }
      );

      if (!existingUser)
        return {
          code: 400,
          success: false,
          message: "User not found",
          errors: [
            {
              field: "usernameOrEmail",
              message: "Username or email incorrect",
            },
          ],
        };

      const passwordValid = await argon2.verify(
        existingUser.password,
        password
      );

      if (!passwordValid)
        return {
          code: 400,
          success: false,
          message: "Wrong password",
          errors: [{ field: "password", message: "Wrong password" }],
        };

      // Create session and return cookie
      req.session.userId = existingUser.id;

      return {
        code: 200,
        success: true,
        message: "Logged in successfully",
        user: existingUser,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Mutation((_return) => Boolean)
  logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise<boolean>((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);

      req.session.destroy((error) => {
        if (error) {
          console.log("DESTROYING SESSION ERROR", error);
          resolve(false);
        }
        resolve(true);
      });
    });
  }
}
