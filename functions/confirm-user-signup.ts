import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { PostConfirmationConfirmSignUpTriggerEvent } from "aws-lambda/trigger/cognito-user-pool-trigger";
import { get } from "env-var";
import lambdaLogger from "pino-lambda";
import { User } from "../lib/entities";

const USERS_TABLE_NAME = get("USERS_TABLE_NAME").required().asString();

const logger = lambdaLogger();
const ddb = new DynamoDBClient({});
const ddbDoc = DynamoDBDocument.from(ddb);

export async function handler(
  event: PostConfirmationConfirmSignUpTriggerEvent,
  contex: any
): Promise<PostConfirmationConfirmSignUpTriggerEvent> {
  logger.withRequest(event, contex);
  logger.info(event, "Event");

  if (event.triggerSource == "PostConfirmation_ConfirmSignUp") {
    const user: User = {
      id: event.userName,
      email: event.request.userAttributes["email"],
      created: new Date().toISOString(),
    };

    await ddbDoc.put({
      TableName: USERS_TABLE_NAME,
      Item: user,
      ConditionExpression: "attribute_not_exists(id)",
    });

    return event;
  } else {
    return event;
  }
}
