import { Chance } from "chance";
import { ulid } from "ulid";
import { ValidationError } from "yup";
import { schema } from "../../functions/update-post";

const chance = new Chance();

describe("When updating a post", () => {
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

  it("title is required", () => {
    expect(() =>
      schema.validateSync({
        id: ulid(),
        title: "",
        body: null,
      })
    ).toThrow(new ValidationError("title is a required field"));
  });

  it("title cannot exceed 100 chars", () => {
    expect(() =>
      schema.validateSync({
        id: ulid(),
        title: chance.string({ length: 101 }),
        body: null,
      })
    ).toThrow(new ValidationError("title must be at most 100 characters"));
  });

  it("body can be null", () => {
    expect(() =>
      schema.validateSync({
        id: ulid(),
        title: chance.string({ length: 10 }),
        body: null,
      })
    ).not.toThrow();
  });

  it("body cannot be undefined", () => {
    expect(() =>
      schema.validateSync({
        id: ulid(),
        title: chance.string({ length: 10 }),
        body: undefined,
      })
    ).toThrow(new ValidationError("body must be defined"));
  });

  it("body cannot exceed 1000 chars", () => {
    expect(() =>
      schema.validateSync({
        id: ulid(),
        title: chance.string({ length: 10 }),
        body: chance.string({ length: 1001 }),
      })
    ).toThrow(new ValidationError("body must be at most 1000 characters"));
  });
});
