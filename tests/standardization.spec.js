import { test, expect } from "@playwright/test";
import { loadIdeationPage, fillResearchAreas } from "./steps/ideations";
import { user1Context, BASE_URL } from "../playwright.config";
test.use({
  storageState: user1Context.path,
});

test.beforeEach(async ({ page }) => {
  await loadIdeationPage(page, `${BASE_URL}/ideas`);
});

test("Research topics standardization", async ({ page, context }) => {
  // standardize title case for topics
  await loadIdeationPage(page, `${BASE_URL}/ideas`);
  await fillResearchAreas(page, ["healthcare"]);
  await expect(page.getByTestId("topicTag")).toContainText("Healthcare");
  await page.getByTestId("removeTopicTag").click();

  // topics can't have speacial characters
  await fillResearchAreas(page, ["Health-care"]);
  await expect(page.getByTestId("topicTag")).toContainText("Healthcare");
  await page.getByTestId("removeTopicTag").click();

  //remove double spacing
  await fillResearchAreas(page, ["Health  care"]);
  await expect(page.getByTestId("topicTag")).toContainText("Health Care");
  await page.getByTestId("removeTopicTag").click();

  // a topic can't exceed 30 characters
  await fillResearchAreas(page, [
    "Health care and medicine in the 21st century",
  ]);
  await expect(
    page.getByText("Each topic must be 30 characters or fewer."),
  ).toBeVisible();
  
  //topics can't start with numbers
  await fillResearchAreas(page, [
    "2Healthcare",
  ]);
  await expect(
    page.getByText("Topic cannot start with a number."),
  ).toBeVisible();
});
