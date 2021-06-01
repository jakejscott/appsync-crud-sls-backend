import { dateRegex } from "../../lib/consts";

describe("given a date regex", () => {
  it("accepts a valid ISO8601 date", () => {
    expect(dateRegex.test(new Date().toISOString())).toBe(true);
  });
});
