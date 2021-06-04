import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { get } from "env-var";
import { Post } from "../../lib/entities";
import * as given from "../steps/given";
import * as when from "../steps/when";

const ddb = new DynamoDB({});
const ddbDoc = DynamoDBDocument.from(ddb);
const postsTableName = get("POSTS_TABLE_NAME").required().asString();

describe("Given an authenticated user has already created some posts", () => {
  let user: given.IAuthenticatedUser;
  const existingPosts: Post[] = [];

  beforeAll(async () => {
    user = await given.an_authenticated_user();
    for (let i = 0; i < 10; i++) {
      const post: Post = given.a_random_post(user);
      existingPosts.push(post);
    }

    await ddbDoc.batchWrite({
      RequestItems: {
        [postsTableName]: existingPosts.map((item) => ({
          PutRequest: {
            Item: item,
          },
        })),
      },
    });
  });

  describe("When they list posts", () => {
    it("It returns the posts in ascending order", async () => {
      const { data } = await when.we_invoke_list_posts(user, 25, null);
      expect(data!.nextToken).toBeNull();
      expect(data!.posts).toMatchObject(existingPosts.reverse());
    });

    it("It returns the posts paginated", async () => {
      const result1 = await when.we_invoke_list_posts(user, 3, null);
      expect(result1.data!.nextToken).toBeTruthy();

      const result2 = await when.we_invoke_list_posts(user, 3, result1.data!.nextToken);
      expect(result2.data!.nextToken).toBeTruthy();

      const result3 = await when.we_invoke_list_posts(user, 3, result2.data!.nextToken);
      expect(result3.data!.nextToken).toBeTruthy();

      const result4 = await when.we_invoke_list_posts(user, 3, result3.data!.nextToken);
      expect(result4.data!.nextToken).toBeFalsy();
    });
  });
});
