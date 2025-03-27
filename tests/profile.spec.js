import { test, expect } from "@playwright/test";
import { expectIsPrivateToBe, loadIdeationPage } from "./steps/ideations";
import {
  updateIsPrivateProfileSettings,
  clickStartPlayingButton,
} from "./steps/profile";
import { user1Context, user2Context, BASE_URL } from "../playwright.config";
import { getIsPrivateFeatureFlag } from "./steps/profile";
import { getIsUnlimitedCreditsFeatureFlag } from "./steps/profile";

const isUnlimitedCredits = await getIsUnlimitedCreditsFeatureFlag();

test.use({
  //NOTE: we use user2 so we don't conflict with ideation test changing privacy
  storageState: user2Context.path,
});

test.beforeEach(async ({ page }) => {
  await page.goto(`${BASE_URL}/profile`);
});

test("user1 tries to use user2's alias", async ({ page, browser }) => {
  // Load User2's profile page and get the alias
  const user2Alias = await page.locator("#outlined-alias").inputValue();

  // Switch to User1's browser context
  const user1BrowserContext = await browser.newContext({
    storageState: user1Context.path,
  });
  const user1Page = await user1BrowserContext.newPage();
  await user1Page.goto(`${BASE_URL}/profile`);

  // Interact with User1's page
  const aliasInput = user1Page.locator("#outlined-alias");
  await aliasInput.fill(user2Alias);

  // Click the "Start Playing" button
  await clickStartPlayingButton(user1Page);

  // Verify that the "Alias is already taken. Please choose another one." message is visible
  await expect(
    user1Page.locator(
      'text="Alias is already taken. Please choose another one."',
    ),
  ).toBeVisible();
});

test("change idea privacy", async ({ page }) => {
  const isPrivateFeatureFlagValue = await getIsPrivateFeatureFlag();

  //verify default idea privacy is the same as the feature flag value
  await expectIsPrivateToBe(page, isPrivateFeatureFlagValue);
  await loadIdeationPage(page, `${BASE_URL}/ideas`);
  await expectIsPrivateToBe(page, isPrivateFeatureFlagValue);

  //flip idea privacy and try to create a new idea and check profile page again
  await page.goto(`${BASE_URL}/profile`);
  await expectIsPrivateToBe(page, isPrivateFeatureFlagValue);
  await updateIsPrivateProfileSettings(page, !isPrivateFeatureFlagValue);
  await expectIsPrivateToBe(page, !isPrivateFeatureFlagValue);
  await page.goto(`${BASE_URL}/profile`);
  await expectIsPrivateToBe(page, !isPrivateFeatureFlagValue);

  //flip default idea privacy back to default and try to create a new idea
  //and check profile page again
  //we are doing this to avoid flakiness on re-runs
  await page.goto(`${BASE_URL}/profile`);
  await updateIsPrivateProfileSettings(page, isPrivateFeatureFlagValue);
  await expectIsPrivateToBe(page, isPrivateFeatureFlagValue);
  await page.goto(`${BASE_URL}/profile`);
  await expectIsPrivateToBe(page, isPrivateFeatureFlagValue);
  
  //TODO: change feature flag value (variants %s) using posthog API and verify the default idea privacy is updated
});

test("unsaved changes prompt on navigation", async ({ page }) => {
  let dialogMessage = null;

  // Set up a dialog event handler
  page.on("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    dialogMessage = dialog.message();
    await dialog.accept(); // Simulate clicking "OK"
  });

  // Make a change to trigger unsaved changes
  const aliasInput = page.locator("#outlined-alias");
  await aliasInput.fill("newAlias");

  // Try to navigate away
  await page.getByTestId("profile-close-icon").nth(1).click();
  // Check if the dialog was shown with the expected message
  expect(dialogMessage).toBe(
    "You have unsaved changes. Are you sure you want to leave?",
  );

  // Check if we've navigated to the buy credits page
  await expect(page).toHaveURL(/.*\/ideas/);
});

test("unsaved changes prompt on logout", async ({ page }) => {
  let dialogMessage = null;

  page.on("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    dialogMessage = dialog.message();
    await dialog.dismiss(); // Simulate clicking "Cancel"
  });

  // Make a change to trigger unsaved changes
  const aliasInput = page.locator("#outlined-alias");
  await aliasInput.fill("newAlias");

  // Try to log out
  await page.click('text="Log out"');

  // Verify that the dialog was shown with the expected message
  expect(dialogMessage).toBe(
    "You have unsaved changes. Are you sure you want to log out?",
  );

  // Verify that we're still on the profile page (didn't log out)
  await expect(page).toHaveURL(`${BASE_URL}/profile`);
});

test("no unsaved changes prompt on navigation when no changes made", async ({
  page,
}) => {
  let dialogShown = false;

  page.on("dialog", async (dialog) => {
    dialogShown = true;
    await dialog.dismiss();
  });

  // Try to navigate away without making changes
  const profileCloseButton = page.getByTestId("profile-close-icon");
  await profileCloseButton.click();

  // Check if we've navigated to the buy credits page without any dialogs
  await expect(page).toHaveURL(/.*\/ideas/);

  // Verify that no dialog was shown
  expect(dialogShown).toBe(false);
});

