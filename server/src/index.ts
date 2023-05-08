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
import { __prod__, COOKIE_NAME } from "./constants";
import { Context } from "./types/Context";
import mongoose from 'mongoose'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { PostResolver } from "./resolvers/post";

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

    const mongoUrl = `mongodb+srv://vrttankzz:0918972561@bookstorev1.5lmxff7.mongodb.net/test`;

    await mongoose.connect(mongoUrl, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    console.log("MongoDB Connected");

    app.set("trust proxy", 1);

    app.use(
      session({
        name: COOKIE_NAME,
        store: MongoStore.create({ mongoUrl }),
        cookie: {
          maxAge: 1000 * 60 * 60, // one hour
          httpOnly: true, // JS front end cannot access the cookie
          secure: false, // cookie only works in https
          // sameSite: 'none',
          // domain: 'http://localhost:4000/graphql'
        },
        secret: process.env.SESSION_SECRET_DEV_PROD as string,
        saveUninitialized: false, // don't save empty sessions, right from the start
        resave: false,
        
      })
    );

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [HelloResolver, UserResolver, PostResolver],
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
