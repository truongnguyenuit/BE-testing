import { AuthenticationError } from "apollo-server-express";
import { Context } from "../types/Context";
import { MiddlewareFn } from "type-graphql";

export const checkAuth: MiddlewareFn<Context> = (
  { context: { req } },
  next
) => {
  if (!req.session.userId)
    throw new AuthenticationError("not authenticated to perform GraphQL");
  return next(); 
};
