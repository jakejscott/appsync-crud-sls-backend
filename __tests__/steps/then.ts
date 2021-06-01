import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { get } from "env-var";
import pino from "pino";
import { Post, User } from "../../lib/entities";

const usersTableName = get("USERS_TABLE_NAME").required().asString();
const postsTableName = get("POSTS_TABLE_NAME").required().asString();

const ddb = new DynamoDBClient({});
const ddbDoc = DynamoDBDocument.from(ddb);
const logger = pino();

export async function user_exists_in_users_table(id: string): Promise<User> {
  logger.info({ id, usersTableName }, "Fetching user");

  const { Item: item } = await ddbDoc.get({
    TableName: usersTableName,
    Key: { id: id },
  });

  expect(item).toBeTruthy();
  return item as User;
}

export async function post_exists_in_posts_table(id: string): Promise<Post> {
  logger.info({ id, postsTableName }, "Fetching post");

  const { Item: item } = await ddbDoc.get({
    TableName: postsTableName,
    Key: { id: id },
  });

  expect(item).toBeTruthy();
  return item as Post;
}

export async function post_not_exists_in_posts_table(id: string) {
  logger.info({ id, postsTableName }, "Fetching post");

  const { Item: item } = await ddbDoc.get({
    TableName: postsTableName,
    Key: { id: id },
  });

  expect(item).toBeFalsy();
}
