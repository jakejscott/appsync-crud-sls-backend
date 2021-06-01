import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import { PostConfirmationConfirmSignUpTriggerEvent } from "aws-lambda";
import { get } from "env-var";
import pino from "pino";
import { handler as confirmUserSignup } from "../../functions/confirm-user-signup";
import { CreateUserInput, handler as createPost } from "../../functions/create-post";
import { AppSyncEvent, AppSyncResult } from "../../lib/appsync";
import { Post } from "../../lib/entities";
import { IAuthenticatedUser } from "./given";
import { gql, GraphQLClient } from "graphql-request";

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
  const context = {};

  const event: AppSyncEvent<CreateUserInput> = createAppSyncEvent(user, {
    title: title,
    body: body,
  });

  const result = await createPost(event, context);
  return result;
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

  const variables = {
    title: title,
    body: body,
  };

  const headers = {
    authorization: user.idToken,
  };

  const data = await graphQLClient.request(mutation, variables, headers);
  return data.createPost;
}
