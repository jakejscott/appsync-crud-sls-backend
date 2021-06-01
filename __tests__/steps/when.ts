import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import { PostConfirmationConfirmSignUpTriggerEvent } from "aws-lambda";
import { get } from "env-var";
import pino from "pino";
import { handler as confirmUserSignup } from "../../functions/confirm-user-signup";

const awsRegion = get("AWS_REGION").required().asString();
const userPoolId = get("COGNITO_USER_POOL_ID").required().asString();
const clientId = get("WEB_USER_POOL_CLIENT_ID").required().asString();

const logger = pino();
const cognito = new CognitoIdentityProvider({});

export async function we_invoke_confirmUserSignup(id: string, email: string) {
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

export type CognitoUser = {
  id: string;
  email: string;
};

export async function a_user_signs_up(email: string, password: string): Promise<CognitoUser> {
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
