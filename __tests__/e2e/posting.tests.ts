import { Chance } from "chance";
import { ListPostsResult } from "../../functions/list-posts";
import { Post } from "../../lib/entities";
import * as given from "../steps/given";
import * as when from "../steps/when";

const chance = new Chance();

describe("Given an authenticated user", () => {
  let user: given.IAuthenticatedUser;
  beforeAll(async () => {
    user = await given.an_authenticated_user();
  });

  describe("When she creates a post", () => {
    let post: Post;

    const title = chance.sentence({ words: 5 });
    const body = chance.paragraph();

    beforeAll(async () => {
      post = await when.a_user_calls_create_post(user, title, body);
    });

    it("Should return the new post", () => {
      expect(post).toMatchObject({
        title: title,
        body: body,
        userId: user.id,
      });
    });

    describe("When she gets a post", () => {
      let getPost: Post;

      beforeAll(async () => {
        getPost = await when.a_user_calls_get_post(user, post.id);
      });

      it("Should return the post", () => {
        expect(getPost).toMatchObject<Post>(post);
      });

      describe("When she lists posts", () => {
        let listPostsResult: ListPostsResult;

        beforeAll(async () => {
          listPostsResult = await when.a_user_calls_list_posts(user, 25, null);
        });

        it("Should return all posts", () => {
          expect(listPostsResult.nextToken).toBeFalsy();
          expect(listPostsResult.posts.length).toBe(1);
        });

        describe("When she updates a post", () => {
          let updatedPost: Post;

          const updatedTitle = chance.sentence({ words: 5 });
          const updatedBody = chance.paragraph();

          beforeAll(async () => {
            updatedPost = await when.a_user_calls_update_post(user, post.id, updatedTitle, updatedBody);
          });

          it("Should return the updated post", () => {
            expect(updatedPost).toMatchObject({
              id: post.id,
              title: updatedTitle,
              body: updatedBody,
              userId: user.id,
            });
          });

          describe("When she deletes a post", () => {
            let deletedPost: Post;

            beforeAll(async () => {
              deletedPost = await when.a_user_calls_delete_post(user, post.id);
            });

            it("Should return the deleted post", () => {
              expect(deletedPost).toMatchObject({
                id: post.id,
                userId: user.id,
              });
            });
          });
        });
      });
    });
  });
});
