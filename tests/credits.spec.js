import { test, expect } from "@playwright/test";
import {
  loadIdeationPage,
  generateAndVerifyIdea,
  getCurrentCredits,
  fillProblem,
  fillResearchAreas,
  clickThinkButton,
  expectThinkButtonToBeVisible,
} from "./steps/ideations";
import { user2Context, BASE_URL } from "../playwright.config";
import {
  getIsUnlimitedCreditsFeatureFlag,
  clickStartPlayingButton
} from "./steps/profile";
const isUnlimitedCredits = await getIsUnlimitedCreditsFeatureFlag();

test.use({
  //NOTE: we use user2 so we don't conflict with ideation test updating credits
  storageState: user2Context.path,
});

test.beforeEach(async ({ page }) => {
  await loadIdeationPage(page, `${BASE_URL}/ideas`);
});

//run tests in series to avoid conflicts/race conditions with credits
test.describe.serial("Run in Series", () => {
  test("generate idea (problem, 3 research topics)", async ({ page }) => {
    // test the paper recency feature
    await page.goto(`${BASE_URL}/profile`);
    await page.getByTestId("paper-recency-slider").click();
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press("ArrowLeft");
    }
    await clickStartPlayingButton(page);

    if (isUnlimitedCredits) {
      await generateAndVerifyIdea(
        page,
        "Applications of Generative AI in healthcare",
        ["Generative Ai", "Healthcare", "Data Analysis"],
        false,
      );
      for (let i = 0; i <= 2; i++) {
        await expect(page.getByTestId(`paper-year-${i}`)).toContainText("2025");
      }
    } else {
      const beforeCredits = await getCurrentCredits(page);
      await generateAndVerifyIdea(
        page,
        "Applications of Generative AI in healthcare",
        ["Generative Ai", "Healthcare", "Data Analysis"],
        false,
      );
      //verify credit is decremented by 1
      const afterCredits = await getCurrentCredits(page);
      expect(afterCredits).toBe(beforeCredits - 1);
      for (let i = 0; i <= 2; i++) {
        await expect(page.getByTestId(`paper-year-${i}`)).toContainText("2025");
      }
    }
  });

  test("fail to generate idea (complex problem and obscure scientific areas)", async ({
    page,
  }) => {
    if (!isUnlimitedCredits) {
      const beforeCredits = await getCurrentCredits(page);
      console.log("normal");
      await fillProblem(
        page,
        "increase wheat yield in Egypt and Philippines and turkey and Canada using artificial intelligence and genetic engineering while eating salad and drinking coffee",
      );
      //changed to title case, an issue is going to be written later for cases like (RAG,NLP etc)
      await fillResearchAreas(page, ["Rag"]);
      await clickThinkButton(page);

      await expect(
        page.getByText("No results found. Please try a different input."),
      ).toBeVisible();
      await expectThinkButtonToBeVisible(page);

      await loadIdeationPage(page, `${BASE_URL}/ideas`);
      const afterCredits = await getCurrentCredits(page);
      expect(beforeCredits).toEqual(afterCredits);
    } else {
      // Skip credit-related checks if "unlimited-credits" is enabled
      console.log("Unlimited credits enabled, skipping credit verification.");
      await fillProblem(
        page,
        "increase wheat yield in Egypt and Philippines and turkey and Canada using artificial intelligence and genetic engineering while eating salad and drinking coffee",
      );
      await fillResearchAreas(page, ["Rag"]);
      await clickThinkButton(page);
      await expect(
        page.getByText("No results found. Please try a different input."),
      ).toBeVisible();
      await expectThinkButtonToBeVisible(page);
    }
  });
});
