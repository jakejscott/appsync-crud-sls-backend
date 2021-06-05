import { Chance } from "chance";
import { AppSyncResult } from "../../lib/appsync";
import { dateRegex } from "../../lib/consts";
import { Post } from "../../lib/entities";
import * as given from "../steps/given";
import * as then from "../steps/then";
import * as when from "../steps/when";

const chance = new Chance();

describe("Given an authenticated user", () => {
  let user: given.IAuthenticatedUser;
  beforeAll(async () => {
    user = await given.an_authenticated_user();
  });

  describe("When they create a post", () => {
    let appSyncResult: AppSyncResult<Post>;
    let postId: string;

    const title = chance.sentence({ words: 5 });
    const body = chance.paragraph();

    beforeAll(async () => {
      appSyncResult = await when.we_invoke_create_post(user, title, body);
      postId = appSyncResult.data!.id;
    });

    it("Saves the post in the posts dynamodb table", async () => {
      const post = await then.post_exists_in_posts_table(postId, user.id);

      expect(post).toMatchObject<Post>({
        id: postId,
        userId: user.id,
        title: title,
        body: body,
        createdAt: expect.stringMatching(dateRegex),
        updatedAt: expect.stringMatching(dateRegex),
      });
    });
  });

  describe("When they create a post with invalid title", () => {
    let appSyncResult: AppSyncResult<Post>;

    beforeAll(async () => {
      appSyncResult = await when.we_invoke_create_post(user, "", "");
    });

    it("Returns a validation error", async () => {
      expect(appSyncResult.data).toBeNull();
      expect(appSyncResult.errorType).toBe("ValidationError");
      expect(appSyncResult.errorInfo).toMatchObject(["title is a required field"]);
      expect(appSyncResult.errorMessage).toBe("title is a required field");
    });
  });
});
