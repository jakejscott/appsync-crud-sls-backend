import { Chance } from "chance";
import { ulid } from "ulid";
import { dateRegex } from "../../lib/consts";
import { Post } from "../../lib/entities";
import * as given from "../steps/given";
import * as then from "../steps/then";
import * as when from "../steps/when";

const chance = new Chance();

describe("Given an authenticated user has already created a post", () => {
  let user: given.IAuthenticatedUser;
  let existingPost: Post;

  beforeAll(async () => {
    user = await given.an_authenticated_user();
    const title = chance.sentence({ words: 5 });
    const body = chance.paragraph();
    const { data } = await when.we_invoke_create_post(user, title, body);
    existingPost = data!;
  });

  describe("When they delete a post", () => {
    let deletedPost: Post;

    beforeAll(async () => {
      const { data } = await when.we_invoke_delete_post(user, existingPost.id);
      deletedPost = data!;
    });

    it("It returns an error when the post is not found", async () => {
      const bogusPostId = ulid();
      const { data, errorMessage, errorType, errorInfo } = await when.we_invoke_delete_post(user, bogusPostId);
      expect(data).toBeNull();
      expect(errorType).toBe("NotFound");
      expect(errorMessage).toBe("Post not found");
      expect(errorInfo).toMatchObject({ postId: bogusPostId });
    });

    it("Deletes the post in the posts dynamodb table", async () => {
      await then.post_not_exists_in_posts_table(deletedPost.id, user.id);

      expect(deletedPost).toMatchObject<Post>({
        id: existingPost.id,
        userId: user.id,
        title: deletedPost.title,
        body: deletedPost.body,
        createdAt: expect.stringMatching(dateRegex),
        updatedAt: expect.stringMatching(dateRegex),
      });
    });
  });
});
