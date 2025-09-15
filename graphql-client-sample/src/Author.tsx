import type { FC } from "react";
import { FragmentType, graphql, useFragment } from "./gql";

export type AuthorProps = {
  name: string;
};

const AuthorFragment = graphql(/* GraphQL */ `
  fragment AuthorFragment on User {
    name
  }
`);

export const Author: FC<{
  authorFragment: FragmentType<typeof AuthorFragment>;
}> = ({ authorFragment }) => {
  const author = useFragment(AuthorFragment, authorFragment);

  return <p>Author: {author.name}</p>;
};
