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

export type UpdatePostInput = {
  id: string;
  title: string;
  body: string | null;
};

const schema: SchemaOf<UpdatePostInput> = object({
  id: string().required().defined(),
  title: string().required().max(100).defined(),
  body: string().max(1000).defined(),
});

export async function handler(event: AppSyncEvent<UpdatePostInput>, contex: any): Promise<AppSyncResult<Post>> {
  try {
    logger.withRequest(event, contex);
    logger.info({ event }, "Event");

    schema.validateSync(event.arguments.input);
    const { id, title, body } = event.arguments.input;
    logger.info({ id }, "Updating post");

    const { Attributes: item } = await ddbDoc.update({
      TableName: postsTableName,
      Key: { id: id },
      UpdateExpression: "set #title = :title, #body = :body, #updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":title": title,
        ":body": body,
        ":updatedAt": new Date().toISOString(),
      },
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body",
        "#updatedAt": "updatedAt",
      },
      ReturnValues: "ALL_NEW",
    });

    const post: Post = item as Post;
    logger.info({ post }, "Post updated");
    return buildResult(post);
  } catch (error) {
    logger.error({ error }, error.name);
    return buildResult(error);
  }
}
