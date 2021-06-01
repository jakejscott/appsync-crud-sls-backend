import { Chance } from "chance";

const chance = new Chance();

export type TestUser = {
  email: string;
  password: string;
};

export function a_random_email(): string {
  const first = chance.first();
  const last = chance.last();
  const suffix = chance.string({ length: 4, pool: "abcdefghijklmnopqrstuvwxyz" });
  const email = `${first}.${last}.${suffix}@example.com`;
  return email;
}

export function a_random_user(): TestUser {
  const password = chance.string({ length: 8 });
  const email = a_random_email();
  return {
    email: email,
    password: password,
  };
}
