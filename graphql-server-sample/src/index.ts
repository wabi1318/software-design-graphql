import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { db } from "./database.js";
import { loadSchemaSync } from "@graphql-tools/load";
import { ApolloServer } from "@apollo/server";
import { addResolversToSchema } from "@graphql-tools/schema";
import { startStandaloneServer } from "@apollo/server/standalone";

const schema = loadSchemaSync("schema.graphql", {
  loaders: [new GraphQLFileLoader()],
});

const resolvers = {
  Query: {
    authors: () =>
      Object.entries(db.users).map(([id, user]) => ({ id, ...user })),
    posts: (_, { tags }) => {
      const allPosts = Object.entries(db.blogs).map(([id, post]) => ({
        id,
        ...post,
      }));

      // タグフィルタリング
      if (!tags || tags.length === 0) {
        return allPosts;
      }

      return allPosts.filter(post =>
        post.tags.some(tag => tags.includes(tag))
      );
    },
  },
  Post: {
    tags: ({ tags }) => tags.map((name) => ({ name })),
    author: ({ author }) => {
      const user = db.users[author];
      return user ? { id: author, ...user } : null;
    },
  },
  Author: {
    posts: ({ id }) =>
      Object.entries(db.blogs)
        .filter(([_, post]) => post.author === id)
        .map(([id, post]) => ({ id, ...post })),
  },
};

const schemaWithResolver = addResolversToSchema({
  schema,
  resolvers,
});
const apolloServer = new ApolloServer({
  schema: schemaWithResolver,
});
const { url } = await startStandaloneServer(apolloServer);

console.log(`Apollo Server started: ${url}`);
