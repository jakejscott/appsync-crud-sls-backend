import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { get } from "env-var";
import lambdaLogger from "pino-lambda";
import { number, object, SchemaOf, string } from "yup";
import { AppSyncEvent, AppSyncResult, buildResult } from "../lib/appsync";
import { Post } from "../lib/entities";

const postsTableName = get("POSTS_TABLE_NAME").required().asString();

const logger = lambdaLogger();
const ddb = new DynamoDBClient({});
const ddbDoc = DynamoDBDocument.from(ddb);

export type ListPostsInput = {
  limit: number | null;
  nextToken: string | null;
};

export type ListPostsResult = {
  posts: Post[];
  nextToken: string | null;
};

export const schema: SchemaOf<ListPostsInput> = object({
  limit: number().nullable().min(1).max(25).defined(),
  nextToken: string().nullable().defined(),
});

export async function handler(
  event: AppSyncEvent<ListPostsInput>,
  contex: any
): Promise<AppSyncResult<ListPostsResult>> {
  try {
    logger.withRequest(event, contex);
    logger.info({ event }, "Event");

    schema.validateSync(event.arguments.input);

    let { nextToken } = event.arguments.input;
    const { sub: userId } = event.identity;

    let exclusiveStartKey: JSON | undefined = undefined;
    if (nextToken) {
      exclusiveStartKey = JSON.parse(Buffer.from(nextToken, "base64").toString("utf8"));
    }

    const { Items: items, LastEvaluatedKey: lastEvaluatedKey } = await ddbDoc.query({
      TableName: postsTableName,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      ExpressionAttributeNames: {
        "#userId": "userId",
      },
      Limit: event.arguments.input.limit ?? 10,
      ScanIndexForward: false,
      ConsistentRead: false,
      Select: "ALL_ATTRIBUTES",
      ExclusiveStartKey: exclusiveStartKey,
    });

    const posts: Post[] = items as Post[];
    logger.info(`Posts found: ${posts.length}`);

    let _nextToken: string | null = null;
    if (lastEvaluatedKey) {
      _nextToken = Buffer.from(JSON.stringify(lastEvaluatedKey), "utf8").toString("base64");
    }

    const result: ListPostsResult = {
      posts: posts,
      nextToken: _nextToken,
    };

    return buildResult(result);
  } catch (error) {
    logger.error({ error }, error.name);
    return buildResult(error);
  }
}
