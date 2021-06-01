import * as given from "../steps/given";
import * as when from "../steps/when";
import * as then from "../steps/then";
import { User } from "../../lib/entities";

describe("When a user signs up", () => {
  it("The user should be saved in dynamodb", async () => {
    const { email, password } = given.a_random_user();
    const user = await when.a_user_signs_up(email, password);
    const ddbUser = await then.user_exists_in_users_table(user.id);
    expect(ddbUser).toMatchObject<User>({
      id: user.id,
      email: email,
      created: expect.stringMatching(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g),
    });
  });
});
