import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { get } from "env-var";
import lambdaLogger from "pino-lambda";
import { ulid } from "ulid";
import { object, SchemaOf, string } from "yup";
import { AppSyncEvent, AppSyncResult, buildResult, getUserId } from "../lib/appsync";
import { Post } from "../lib/entities";

const postsTableName = get("POSTS_TABLE_NAME").required().asString();

const logger = lambdaLogger();
const ddb = new DynamoDBClient({});
const ddbDoc = DynamoDBDocument.from(ddb);

export type CreatePostInput = {
  title: string;
  body: string | null;
};

export const schema: SchemaOf<CreatePostInput> = object({
  title: string().required().max(100).defined(),
  body: string().nullable().max(1000).defined(),
});

export async function handler(event: AppSyncEvent<CreatePostInput>, contex: any): Promise<AppSyncResult<Post>> {
  try {
    logger.withRequest(event, contex);
    logger.info({ event }, "Event");

    schema.validateSync(event.arguments.input);
    const { title, body } = event.arguments.input;

    const userId = getUserId(event);
    const now = new Date().toISOString();

    const post: Post = {
      id: ulid(),
      userId: userId,
      title: title,
      body: body,
      createdAt: now,
      updatedAt: now,
    };

    logger.info({ post }, "Creating post");

    await ddbDoc.put({
      TableName: postsTableName,
      Item: post,
    });

    logger.info({ post }, "Post created");

    return buildResult(post);
  } catch (error) {
    logger.error({ error }, error.name);
    return buildResult(error);
  }
}
