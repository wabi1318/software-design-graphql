import { type FC, useState } from "react";
import { useMutation, useQuery } from "urql";
import { ChoosableTags } from "./App";
import { graphql } from "./gql";

const CreatePostMutation = graphql(/* GraphQL */ `
  mutation createPost($input: CreatePostInput!) {
    createPost(input: $input) {
      __typename
      ... on CreatePostSuccess {
        post {
          id
          title
          body
          author {
            id
            name
          }
        }
      }
      ... on Error {
        message
      }
    }
  }
`);

const AuthorsQuery = graphql(/* GraphQL */ `
  query authors {
    authors {
      id
      name
    }
  }
`);

type Input = {
  title: string;
  body: string;
  tags: string[];
  publishedAt: string;
  author: string;
};

export const NewPostForm: FC = () => {
  const [input, setInput] = useState<Input>({
    title: "",
    body: "",
    tags: [],
    publishedAt: "",
    author: "",
  });

  const [createPostResult, createPost] = useMutation(CreatePostMutation);
  const [authorsResult] = useQuery({ query: AuthorsQuery });
  const authors = authorsResult.data?.authors || [];

  return (
    <>
      <h2>New Post</h2>

      <div>
        <label>title</label>
      </div>
      <input onChange={(e) => setInput({ ...input, title: e.target.value })} />

      <div>
        <label>body</label>
      </div>
      <textarea
        onChange={(e) => setInput({ ...input, body: e.target.value })}
      />
      <div>
        <label>tags</label>
      </div>
      {ChoosableTags.map((choosableTag) => (
        <div key={choosableTag}>
          <input
            type="checkbox"
            id={`new-post-${choosableTag}`}
            name={choosableTag}
            checked={input.tags.includes(choosableTag)}
            onChange={(e) => {
              e.target.checked
                ? setInput({
                    ...input,
                    tags: [...input.tags, e.target.name],
                  })
                : setInput({
                    ...input,
                    tags: input.tags.filter((t) => t !== e.target.name),
                  });
            }}
          />
          <label htmlFor={`new-post-${choosableTag}`}>{choosableTag}</label>
        </div>
      ))}
      <div>
        <label>author</label>
      </div>
      <select onChange={(e) => setInput({ ...input, author: e.target.value })}>
        {authorsResult.fetching && <option>Loading...</option>}
        {authors.map((author) => (
          <option key={author.id} value={author.name}>
            {author.name}
          </option>
        ))}
      </select>
      <div>
        <button
          type="button"
          onClick={() => {
            createPost({
              input: { ...input, publishedAt: new Date().toISOString() },
            });
          }}
        >
          Create
        </button>
      </div>
      {createPostResult.fetching ? (
        <p>Creating...</p>
      ) : createPostResult.error ? (
        <p>Oh no... {createPostResult.error.message}</p>
      ) : createPostResult?.data?.createPost?.__typename !==
        "CreatePostSuccess" ? (
        <p>Oh no... {createPostResult?.data?.createPost?.message}</p>
      ) : (
        <p>Created!</p>
      )}
    </>
  );
};
