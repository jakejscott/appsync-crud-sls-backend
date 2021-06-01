import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { get } from "env-var";
import pino from "pino";
import { User } from "../../lib/entities";

const usersTableName = get("USERS_TABLE_NAME").required().asString();

const ddb = new DynamoDBClient({});
const ddbDoc = DynamoDBDocument.from(ddb);
const logger = pino();

export async function user_exists_in_users_table(id: string): Promise<User> {
  logger.info({ id, usersTableName }, "Fetching user");
  const { Item: item } = await ddbDoc.get({ TableName: usersTableName, Key: { id: id } });
  expect(item).toBeTruthy();
  return item as User;
}
