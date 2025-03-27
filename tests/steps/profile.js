import { expect } from "@playwright/test";
import { getLoginLink, getUserEmailForPage } from "./email";
import {
  BASE_URL,
  POSTHOG_API_KEY,
  FREE_CREDITS,
} from "../../playwright.config";
import { PostHog } from "posthog-node";
import { isPrivateSwitchChecked } from "./ideations";

export async function getIsPrivateFeatureFlag() {
  const posthog = new PostHog(POSTHOG_API_KEY, {
    host: "https://us.i.posthog.com",
  });

  return await posthog.getFeatureFlagPayload(
    "ideas-private-by-default",
    "userid",
  );
}
export async function getIsUnlimitedCreditsFeatureFlag() {
  const posthog = new PostHog(POSTHOG_API_KEY, {
    host: "https://us.i.posthog.com",
  });
  return await posthog.getFeatureFlagPayload("unlimited-credits", "userid");
}

const isUnlimitedCredits = await getIsUnlimitedCreditsFeatureFlag();

export async function openAndAcceptLegalDocument(page, documentName) {
  const documentLink = page.locator(`#${documentName}_link`);
  await expect(documentLink).toBeVisible();

  const newPagePromise = page.waitForEvent("popup");
  await documentLink.click();
  const newPage = await newPagePromise;

  // tried to get the pdf content using pdf-parser,pdf-lib and pdf.js but neither is working!
  // seems playwright does not support pdf rendering properly specially on mobile devices!
  // tries to check if the new page was opened successfully but failed CICD
  // await newPage.waitForLoadState('load');
  await newPage.close();

  const acceptDocumentCheckbox = page.locator(`#${documentName}`);
  await expect(acceptDocumentCheckbox).toBeVisible();
  await acceptDocumentCheckbox.click();
}

export async function expectLegalSectionToBeHidden(page, legalDocuments) {
  for (const documentName of legalDocuments) {
    await expect(page.locator(`#${documentName}_link`)).not.toBeVisible();
    await expect(page.locator(`#${documentName}`)).not.toBeVisible();
  }
}

export async function loginWithEmailMagicLink(page) {
  const userEmail = await getUserEmailForPage(page);
  console.log("Attempting to login with magic link using email:", userEmail);
  await page.fill('input[class="supertokens-input"]', userEmail);
  await page.click('button[type="submit"]');

  const loginLink = await getLoginLink(userEmail);
  await page.goto(loginLink);
}

export async function logout(page) {
  await page.goto(`${BASE_URL}/profile`);
  //more stable
  await page.getByTestId("profile-logout-button").click();
  await expect(page.getByText(`Sign Up / Sign In`)).toBeVisible();
}

export async function expectIdeasPageAfterFirstLogin(page) {
  await page.waitForURL("**/ideas");
  await expect(page).toHaveTitle("SeeChat x Ideas");
  if (!isUnlimitedCredits) {
    await expect(
      page.getByText(`You have ${FREE_CREDITS} credits left `),
    ).toBeVisible();
  } else {
    await expect(page.getByText("Unlimited Credits")).toBeVisible();
  }
}

export async function expectSignUpForFreeCredit(page) {
  await expect(page.getByText("You are not signed in")).toBeVisible();
  const signupButton = page.locator("#signupButton");
  await signupButton.click();
  await page.waitForURL("**/auth");
  await expect(page.getByText(`Sign Up / Sign In`)).toBeVisible();
}

export async function clickStartPlayingButton(page) {
  const startPlayingButton = page.getByRole("button", {
    name: "Start Playing",
  });
  await expect(startPlayingButton).toBeVisible();
  await expect(startPlayingButton).toBeEnabled();

  await startPlayingButton.click();
}

export async function clickAndVerifyStartPlayingButton(page) {
  await clickStartPlayingButton(page);

  const processingButton = page.getByRole("button", { name: "Processing..." });
  await expect(processingButton).toBeVisible();

  await page.waitForURL("**/ideas");
}

export async function updateIsPrivateProfileSettings(page, isPrivate) {
  const privateSwitchChecked = await isPrivateSwitchChecked(page);
  // wait 3 seconds to avoid flakiness
  await page.waitForTimeout(3000);

  if (privateSwitchChecked != isPrivate) {
    const privateSwitch = page.locator("#privateSwitch");
    await privateSwitch.click();
  }
  await clickAndVerifyStartPlayingButton(page);
}

// Function to generate a valid alias
export function generateValidAlias() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const length = Math.floor(Math.random() * (20 - 5 + 1)) + 5; // Random length between 5 and 20
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
