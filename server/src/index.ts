require("dotenv").config();
import "reflect-metadata"; //??
import { DataSource } from "typeorm";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

import { HelloResolver } from "./resolvers/hello";
import { UserResolver } from "./resolvers/user";

import { User } from "./entities/User";
import { Post } from "./entities/Post";

import express from "express";
import { __prod__ } from "./constants";
import { Context } from "./types/Context";  

export const dataSource = new DataSource({
  type: "postgres",
  database: "bookstore",
  username: process.env.DB_USERNAME_DEV,
  password: process.env.DB_PASSWORD_DEV,
  logging: true,
  synchronize: true,
  entities: [User, Post],
});

const main = async () => {
  try {
    await dataSource.initialize();

    const app = express();

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [HelloResolver, UserResolver],
        validate: false,
      }),
      context: ({ req, res }): Context => ({ req, res }),
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app, cors: false });

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () =>
      console.log(
        `Server started on port ${PORT}. GraphQL server start on localhost:${PORT}${apolloServer.graphqlPath}`
      )
    );
  } catch (error) {
    console.log(error);
  }
};

main().catch((error) => console.log(error));
