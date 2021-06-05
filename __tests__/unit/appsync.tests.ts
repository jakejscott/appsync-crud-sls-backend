import { getUserId, UnauthorizedException } from "../../lib/appsync";

describe("When getting a userId from the event", () => {
  it("throws UnauthorizedException if the identity is null", () => {
    expect(() =>
      getUserId({
        identity: null,
        arguments: {
          input: {},
        },
      })
    ).toThrow(new UnauthorizedException("sub claim missing"));
  });

  it("throws UnauthorizedException if the sub claim is null", () => {
    expect(() =>
      getUserId({
        identity: {
          sub: null,
        },
        arguments: {
          input: {},
        },
      })
    ).toThrow(new UnauthorizedException("sub claim missing"));
  });

  it("throws UnauthorizedException if the sub claim is empty string", () => {
    expect(() =>
      getUserId({
        identity: {
          sub: "",
        },
        arguments: {
          input: {},
        },
      })
    ).toThrow(new UnauthorizedException("sub claim missing"));
  });

  it("throws UnauthorizedException if the sub claim is undefined", () => {
    expect(() =>
      getUserId({
        identity: {
          sub: undefined,
        },
        arguments: {
          input: {},
        },
      })
    ).toThrow(new UnauthorizedException("sub claim missing"));
  });
});
