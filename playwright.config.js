import { defineConfig, devices } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, ".env") });

export const BASE_URL = process.env.FRONTEND_URL;
export const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;

export const user1Context = {
  path: path.resolve(__dirname, "tests/playwright/.auth/user1.json"),
};
export const user2Context = {
  path: path.resolve(__dirname, "tests/playwright/.auth/user2.json"),
};
export const anonymousUserContext = {
  path: path.resolve(__dirname, "tests/playwright/.auth/anonymous-user.json"),
};

fs.mkdirSync(path.dirname(anonymousUserContext.path), { recursive: true });
if (!fs.existsSync(anonymousUserContext.path)) {
  fs.writeFileSync(
    anonymousUserContext.path,
    JSON.stringify({ cookies: [], origins: [] }),
  );
}

export const FREE_CREDITS = 10;

export default defineConfig({
  timeout: 4 * 60 * 1000,
  expect: {
    timeout: 3 * 60 * 1000,
  },
  workers: 4,
  fullyParallel: true,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  headless: false,
  retries: 1,
  use: {
    actionTimeout: 0,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "setup",
      use: {
        ...devices["Pixel 5"],
      },
      testMatch: "**/*.setup.js",
      fullyParallel: false,
    },
    {
      name: "android",
      use: {
        ...devices["Pixel 5"],
      },
      dependencies: ["setup"],
      permissions: ["clipboard-read", "clipboard-write"],
      fullyParallel: true,
    },
  ],
});
