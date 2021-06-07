import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { get } from "env-var";
import lambdaLogger from "pino-lambda";
import { object, SchemaOf, string } from "yup";
import { AppSyncEvent, AppSyncResult, buildResult, getUserId, NotFoundException } from "../lib/appsync";
import { Post } from "../lib/entities";

const postsTableName = get("POSTS_TABLE_NAME").required().asString();

const logger = lambdaLogger();
const ddb = new DynamoDBClient({});
const ddbDoc = DynamoDBDocument.from(ddb);

export type GetPostInput = {
  id: string;
};

export const schema: SchemaOf<GetPostInput> = object({
  id: string().required().defined(),
});

export async function handler(event: AppSyncEvent<GetPostInput>, contex: any): Promise<AppSyncResult<Post>> {
  try {
    logger.withRequest(event, contex);

    schema.validateSync(event.arguments.input);

    const { id } = event.arguments.input;
    const userId = getUserId(event);

    logger.info({ id, userId }, "Getting post");

    try {
    } catch (error) {}
    const { Item: item } = await ddbDoc.get({
      TableName: postsTableName,
      Key: { id: id, userId: userId },
    });

    if (!item) {
      throw new NotFoundException("Post not found", { postId: id });
    }

    const post: Post = item as Post;
    logger.info({ post }, "Post found");
    return buildResult(post);
  } catch (error) {
    logger.error({ error }, error.name);
    return buildResult(error);
  }
}
