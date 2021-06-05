import { Chance } from "chance";
import { ValidationError } from "yup";
import { schema } from "../../functions/delete-post";

const chance = new Chance();

describe("When deleting a post", () => {
  it("id is required", () => {
    expect(() =>
      schema.validateSync({
        id: "",
        title: chance.string({ length: 50 }),
        body: null,
      })
    ).toThrow(new ValidationError("id is a required field"));
  });

  it("id cannot be undefined", () => {
    expect(() =>
      schema.validateSync({
        id: undefined,
        title: chance.string({ length: 50 }),
        body: null,
      })
    ).toThrow(new ValidationError("id is a required field"));
  });
});
