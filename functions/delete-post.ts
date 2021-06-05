import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { get } from "env-var";
import lambdaLogger from "pino-lambda";
import { object, SchemaOf, string } from "yup";
import { AppSyncEvent, AppSyncResult, buildResult } from "../lib/appsync";
import { Post } from "../lib/entities";

const postsTableName = get("POSTS_TABLE_NAME").required().asString();

const logger = lambdaLogger();
const ddb = new DynamoDBClient({});
const ddbDoc = DynamoDBDocument.from(ddb);

export type DeletePostInput = {
  id: string;
};

export const schema: SchemaOf<DeletePostInput> = object({
  id: string().required().defined(),
});

export async function handler(event: AppSyncEvent<DeletePostInput>, contex: any): Promise<AppSyncResult<Post>> {
  try {
    logger.withRequest(event, contex);
    logger.info({ event }, "Event");

    schema.validateSync(event.arguments.input);

    const { id } = event.arguments.input;
    const { sub: userId } = event.identity;

    logger.info({ id, userId }, "Deleting post");

    const { Attributes: item } = await ddbDoc.delete({
      TableName: postsTableName,
      Key: { id: id, userId: userId },
      ReturnValues: "ALL_OLD",
    });

    const post: Post = item as Post;
    logger.info({ post }, "Post deleted");
    return buildResult(post);
  } catch (error) {
    logger.error({ error }, error.name);
    return buildResult(error);
  }
}
