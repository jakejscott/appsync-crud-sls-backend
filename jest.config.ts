import type { Config } from "@jest/types";

import * as dotenv from "dotenv";
dotenv.config();

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  testMatch: ["**/__tests__/**/*"],
  maxWorkers: 1,
};

export default config;
