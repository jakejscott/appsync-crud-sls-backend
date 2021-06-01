import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import { Chance } from "chance";
import { get } from "env-var";
import pino from "pino";

const userPoolId = get("COGNITO_USER_POOL_ID").required().asString();
const clientId = get("WEB_USER_POOL_CLIENT_ID").required().asString();

const chance = new Chance();
const cognito = new CognitoIdentityProvider({});
const logger = pino();

export interface IUser {
  email: string;
  password: string;
}

export interface IAuthenticatedUser {
  id: string;
  email: string;
  idToken: string;
  accessToken: string;
}

export function a_random_user(): IUser {
  const password = chance.string({ length: 8 });
  const first = chance.first({ nationality: "en" });
  const last = chance.last({ nationality: "en" });
  const suffix = chance.string({ length: 4, pool: "abcdefghijklmnopqrstuvwxyz" });
  const email = `${first}.${last}.${suffix}@example.com`.toLowerCase();

  return {
    email: email,
    password: password,
  };
}

export async function an_authenticated_user(): Promise<IAuthenticatedUser> {
  const { email, password } = a_random_user();

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

  const auth = await cognito.initiateAuth({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  logger.info({ email, id }, "Signed in");

  const user: IAuthenticatedUser = {
    id: id!,
    email: email,
    accessToken: auth.AuthenticationResult!.AccessToken!,
    idToken: auth.AuthenticationResult!.IdToken!,
  };

  return user;
}
