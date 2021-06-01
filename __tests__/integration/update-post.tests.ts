import { Chance } from "chance";
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

  describe("When they update a post", () => {
    let updatedPost: Post;

    const title = chance.sentence({ words: 5 });
    const body = chance.paragraph();

    beforeAll(async () => {
      const { data } = await when.we_invoke_update_post(user, existingPost.id, title, body);
      updatedPost = data!;
    });

    it("Updates the post in the posts dynamodb table", async () => {
      const post = await then.post_exists_in_posts_table(updatedPost.id);

      expect(post).toMatchObject<Post>({
        id: existingPost.id,
        userId: user.id,
        title: title,
        body: body,
        createdAt: expect.stringMatching(dateRegex),
        updatedAt: expect.stringMatching(dateRegex),
      });
    });
  });
});