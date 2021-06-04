import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import { PostConfirmationConfirmSignUpTriggerEvent } from "aws-lambda";
import { get } from "env-var";
import { gql, GraphQLClient } from "graphql-request";
import pino from "pino";
import { handler as confirmUserSignup } from "../../functions/confirm-user-signup";
import { CreatePostInput, handler as createPost } from "../../functions/create-post";
import { DeletePostInput, handler as deletePost } from "../../functions/delete-post";
import { GetPostInput, handler as getPost } from "../../functions/get-post";
import { handler as updatePost, UpdatePostInput } from "../../functions/update-post";
import { AppSyncEvent, AppSyncResult } from "../../lib/appsync";
import { Post } from "../../lib/entities";
import { IAuthenticatedUser } from "./given";

const awsRegion = get("AWS_REGION").required().asString();
const userPoolId = get("COGNITO_USER_POOL_ID").required().asString();
const clientId = get("WEB_USER_POOL_CLIENT_ID").required().asString();
const appSyncApiUrl = get("APP_SYNC_API_URL").required().asString();

const logger = pino();
const cognito = new CognitoIdentityProvider({});
const graphQLClient = new GraphQLClient(appSyncApiUrl);

export async function we_invoke_confirm_user_signup(id: string, email: string) {
  const context = {};
  const event: PostConfirmationConfirmSignUpTriggerEvent = {
    version: "1",
    region: awsRegion,
    userPoolId: userPoolId,
    userName: id,
    callerContext: { awsSdkVersion: "1", clientId: "" },
    triggerSource: "PostConfirmation_ConfirmSignUp",
    request: {
      userAttributes: {
        sub: id,
        email: email,
        email_verified: "true",
        "cognito:email_alias": email,
        "cognito:user_status": "CONFIRMED",
      },
    },
    response: {},
  };

  await confirmUserSignup(event, context);
}

export interface ICognitoUser {
  id: string;
  email: string;
}

export async function a_user_signs_up(email: string, password: string): Promise<ICognitoUser> {
  const { UserSub: id } = await cognito.signUp({
    Username: email,
    Password: password,
    ClientId: clientId,
  });

  expect(id).toBeTruthy();

  logger.info({ email, id }, "User has signed up");

  await cognito.adminConfirmSignUp({
    UserPoolId: userPoolId,
    Username: email,
  });

  logger.info({ email, id }, "Confirmed sign up");

  return { id: id!, email: email };
}

export async function we_invoke_create_post(
  user: IAuthenticatedUser,
  title: string,
  body: string
): Promise<AppSyncResult<Post>> {
  const event: AppSyncEvent<CreatePostInput> = createAppSyncEvent(user, {
    title: title,
    body: body,
  });
  return await createPost(event, {});
}

export async function we_invoke_update_post(
  user: IAuthenticatedUser,
  postId: string,
  title: string,
  body: string
): Promise<AppSyncResult<Post>> {
  const event: AppSyncEvent<UpdatePostInput> = createAppSyncEvent(user, {
    id: postId,
    title: title,
    body: body,
  });
  return await updatePost(event, {});
}

export async function we_invoke_delete_post(user: IAuthenticatedUser, postId: string): Promise<AppSyncResult<Post>> {
  const event: AppSyncEvent<DeletePostInput> = createAppSyncEvent(user, {
    id: postId,
  });
  return await deletePost(event, {});
}

export async function we_invoke_get_post(user: IAuthenticatedUser, postId: string): Promise<AppSyncResult<Post>> {
  const event: AppSyncEvent<GetPostInput> = createAppSyncEvent(user, {
    id: postId,
  });
  return await getPost(event, {});
}

function createAppSyncEvent<T>(user: IAuthenticatedUser, args: T) {
  const event: AppSyncEvent<T> = {
    arguments: {
      input: args,
    },
    identity: {
      sub: user.id,
      email: user.email,
    },
  };
  return event;
}

export async function a_user_calls_create_post(
  user: IAuthenticatedUser,
  title: string,
  body: string | null
): Promise<Post> {
  const mutation = gql`
    mutation CreatePost($title: String!, $body: String) {
      createPost(input: { title: $title, body: $body }) {
        id
        userId
        title
        body
        createdAt
        updatedAt
      }
    }
  `;

  const variables: CreatePostInput = {
    title: title,
    body: body,
  };

  const headers = {
    authorization: user.idToken,
  };

  const data = await graphQLClient.request(mutation, variables, headers);
  return data.createPost;
}

export async function a_user_calls_update_post(
  user: IAuthenticatedUser,
  postId: string,
  title: string,
  body: string | null
): Promise<Post> {
  const mutation = gql`
    mutation UpdatePost($id: ID!, $title: String!, $body: String) {
      updatePost(input: { id: $id, title: $title, body: $body }) {
        id
        userId
        title
        body
        createdAt
        updatedAt
      }
    }
  `;

  const variables: UpdatePostInput = {
    id: postId,
    title: title,
    body: body,
  };

  const headers = {
    authorization: user.idToken,
  };

  const data = await graphQLClient.request(mutation, variables, headers);
  return data.updatePost;
}

export async function a_user_calls_delete_post(user: IAuthenticatedUser, postId: string): Promise<Post> {
  const mutation = gql`
    mutation DeletePost($id: ID!) {
      deletePost(input: { id: $id }) {
        id
        userId
        title
        body
        createdAt
        updatedAt
      }
    }
  `;

  const variables: DeletePostInput = {
    id: postId,
  };

  const headers = {
    authorization: user.idToken,
  };

  const data = await graphQLClient.request(mutation, variables, headers);
  return data.deletePost;
}
