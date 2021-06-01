import { PostConfirmationConfirmSignUpTriggerEvent } from "aws-lambda";
import { config } from "dotenv";
import { get } from "env-var";
import { handler as confirmUserSignup } from "../../functions/confirm-user-signup";

config();

const COGNITO_USER_POOL_ID = get("COGNITO_USER_POOL_ID").required().asString();
const AWS_REGION = get("AWS_REGION").required().asString();

export async function we_invoke_confirmUserSignup(id: string, email: string) {
  const context = {};
  const event: PostConfirmationConfirmSignUpTriggerEvent = {
    version: "1",
    region: AWS_REGION,
    userPoolId: COGNITO_USER_POOL_ID,
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
