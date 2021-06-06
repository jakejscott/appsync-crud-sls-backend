import * as dotenv from "dotenv";
dotenv.config();

import { an_authenticated_user } from "../__tests__/steps/given";

async function main() {
  const user = await an_authenticated_user();
  console.log("User signed up:", user);
}

main();
