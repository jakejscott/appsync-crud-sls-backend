import { Chance } from "chance";
import { ulid } from "ulid";
import { Post } from "../../lib/entities";
import * as given from "../steps/given";
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

  describe("When they get a post", () => {
    it("It returns the correct post from dynamodb", async () => {
      const { data } = await when.we_invoke_get_post(user, existingPost.id);
      const post: Post = data!;
      expect(post).toMatchObject<Post>(existingPost);
    });

    it("It returns an error when the post is not found", async () => {
      const bogusPostId = ulid();
      const { data, errorMessage, errorType, errorInfo } = await when.we_invoke_get_post(user, bogusPostId);
      expect(data).toBeNull();
      expect(errorType).toBe("NotFound");
      expect(errorMessage).toBe("Post not found");
      expect(errorInfo).toMatchObject({ postId: bogusPostId });
    });
  });
});
