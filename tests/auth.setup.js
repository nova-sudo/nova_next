import { test as setup, expect } from "@playwright/test";
import {
  generateUserEmail,
  getUserEmailForPage,
  saveUserEmailForPage,
} from "./steps/email";
import {
  user1Context,
  user2Context,
  anonymousUserContext,
  BASE_URL,
  FREE_CREDITS,
  POSTHOG_API_KEY,
} from "../playwright.config";
import { PostHog } from "posthog-node";
import {
  loginWithEmailMagicLink,
  openAndAcceptLegalDocument,
  logout,
  expectIdeasPageAfterFirstLogin,
  expectSignUpForFreeCredit,
  generateValidAlias,
  clickAndVerifyStartPlayingButton,
  clickStartPlayingButton,
} from "./steps/profile";
import { clickThinkButton, loadIdeationPage } from "./steps/ideations";
import { getIsUnlimitedCreditsFeatureFlag } from "./steps/profile";
const anonymousTestTitle = "anonymous user";
const isUnlimitedCredits = await getIsUnlimitedCreditsFeatureFlag();

setup.beforeEach(async ({ page }, { title }) => {
  if (title === anonymousTestTitle) {
    return;
  }
  await page.goto(`${BASE_URL}/auth`);

  //generate and save the userEmail data into page localStorage to be used for re-login test
  const generatedUserEmail = generateUserEmail(page);
  await saveUserEmailForPage(page, generatedUserEmail);

  await loginWithEmailMagicLink(page);

  // Wait for redirection to the profile page and for the page to fully load
  await page.waitForSelector('text="Profile info"');
  await expect(page).toHaveURL(`${BASE_URL}/profile`);

  const userEmail = await getUserEmailForPage(page);

  expect(userEmail).toBe(generatedUserEmail);
  await expect(page.getByText(`User ID: ${userEmail}`)).toBeVisible();
  if (!isUnlimitedCredits) {
    await expect(
      page.getByText(`Available Credits: ${FREE_CREDITS}`),
    ).toBeVisible();
  }

  // Test starting without legal agreement
  await testStartPlayingWithoutLegalAgreement(page);

  const legalDocuments = [
    "terms_and_conditions",
    "privacy_policy",
    "cookie_policy",
  ];

  for (const documentName of legalDocuments) {
    await openAndAcceptLegalDocument(page, documentName);
  }

  // Test alias validation
  await testAliasValidation(page);

  await expectIdeasPageAfterFirstLogin(page);
  console.log("Authentication completed successfully.");
});

async function testAliasValidation(page) {
  const aliasInput = page.locator("#outlined-alias");
  // Test for empty alias
  await clickStartPlayingButton(page);
  await expect(
    page.locator('text="Alias must be between 5 and 20 characters long."'),
  ).toBeVisible();

  // Test invalid alias (too short)
  await aliasInput.fill("test");
  await clickStartPlayingButton(page);
  await expect(
    page.locator('text="Alias must be between 5 and 20 characters long."'),
  ).toBeVisible();

  // Test invalid alias (invalid characters)
  await aliasInput.fill("Test@123");
  await clickStartPlayingButton(page);
  await expect(
    page.locator(
      'text="Alias can only contain lowercase letters and numbers."',
    ),
  ).toBeVisible();

  // Test valid alias
  const validAlias = generateValidAlias();
  await aliasInput.fill(validAlias);
  await clickAndVerifyStartPlayingButton(page);
}

async function testStartPlayingWithoutLegalAgreement(page) {
  await clickStartPlayingButton(page);
  await expect(
    page.getByText(
      "You must agree to legal documents before generating ideas.",
    ),
  ).toBeVisible();

  //wait for the alert to disappear
  await expect(
    page.getByText(
      "You must agree to legal documents before generating ideas.",
    ),
  ).toBeHidden();
}

setup("authenticate user1", async ({ page }) => {
  //press start playing button and check that the user is redirected to the ideation page with free credit
  await page.context().storageState({ ...user1Context });
});

setup("authenticate user2, logout then login", async ({ page }) => {
  //test for issue #444, make sure re-logged-in user is redirected to the ideas page if he coming from /ideas
  await logout(page);

  //open ideas page and try to press think button
  await loadIdeationPage(page, `${BASE_URL}/ideas`);
  await clickThinkButton(page);
  await expectSignUpForFreeCredit(page);

  await loginWithEmailMagicLink(page);
  await expectIdeasPageAfterFirstLogin(page);


  await page.context().storageState({ ...user2Context });
});

setup(anonymousTestTitle, async ({ page }) => {
  //verify /ideation redirects to /ideas
  await loadIdeationPage(page, `${BASE_URL}/ideas`);
  await expect(page).toHaveURL(`${BASE_URL}/ideas`);
  await expect(page).toHaveTitle("SeeChat x Ideas");
  if (!isUnlimitedCredits) {
    await expect(page.getByText("You have 0 credits , get more")).toBeVisible(); //disable for unlimited-credits feature flag on
  }

  // Click on the profile account button and wait for the auth page
  const profileButton = page.locator("#profileButton");
  await profileButton.click();

  //wait for /auth?redirect=... or similar
  await page.waitForURL("**/auth?redirectToPath=%2Fprofile");
  await expect(page.getByText(`Sign Up / Sign In`)).toBeVisible();
});
