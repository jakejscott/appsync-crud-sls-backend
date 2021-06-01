import { Chance } from "chance";
import { dateRegex } from "../../lib/consts";
import { User } from "../../lib/entities";
import * as given from "../steps/given";
import * as then from "../steps/then";
import * as when from "../steps/when";

const chance = new Chance();

describe("When confirmUserSignup runs", () => {
  it("The user should be saved in dynamodb", async () => {
    const { email } = given.a_random_user();
    const id = chance.guid();
    await when.we_invoke_confirm_user_signup(id, email);
    const user = await then.user_exists_in_users_table(id);
    expect(user).toMatchObject<User>({
      id: id,
      email: email,
      created: expect.stringMatching(dateRegex),
    });
  });
});
