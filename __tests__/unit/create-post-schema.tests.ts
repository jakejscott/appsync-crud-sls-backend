import { Chance } from "chance";
import { ValidationError } from "yup";
import { schema } from "../../functions/create-post";

const chance = new Chance();

describe("When creating a post", () => {
  it("title is required", () => {
    expect(() =>
      schema.validateSync({
        title: "",
        body: null,
      })
    ).toThrow(new ValidationError("title is a required field"));
  });

  it("title cannot exceed 100 chars", () => {
    expect(() =>
      schema.validateSync({
        title: chance.string({ length: 101 }),
        body: null,
      })
    ).toThrow(new ValidationError("title must be at most 100 characters"));
  });

  it("body can be null", () => {
    expect(() =>
      schema.validateSync({
        title: chance.string({ length: 10 }),
        body: null,
      })
    ).not.toThrow();
  });

  it("body cannot exceed 1000 chars", () => {
    expect(() =>
      schema.validateSync({
        title: chance.string({ length: 10 }),
        body: chance.string({ length: 1001 }),
      })
    ).toThrow(new ValidationError("body must be at most 1000 characters"));
  });
});
