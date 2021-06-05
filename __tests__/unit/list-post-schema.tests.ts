import { ValidationError } from "yup";
import { schema } from "../../functions/list-posts";

describe("When listing posts", () => {
  it("limit can be null", () => {
    expect(() =>
      schema.validateSync({
        limit: null,
        nextToken: null,
      })
    ).not.toThrow();
  });

  it("limit min is 1", () => {
    expect(() =>
      schema.validateSync({
        limit: 0,
        nextToken: null,
      })
    ).toThrow(new ValidationError("limit must be greater than or equal to 1"));
  });

  it("limit max is 25", () => {
    expect(() =>
      schema.validateSync({
        limit: 26,
        nextToken: null,
      })
    ).toThrow(new ValidationError("limit must be less than or equal to 25"));
  });
});
``;
