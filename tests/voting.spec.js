import { test } from "@playwright/test";
import {
  generateAndVerifyIdea,
  loadIdeationPage,
  updateIdeaIsPrivate,
  waitForIdeaSave,
} from "./steps/ideations";
import { clickVotingButton, expectVotingToBe } from "./steps/voting";
import { VOTE } from "../src/components/Idea/VoteUpDown";

import { user1Context, user2Context, BASE_URL } from "../playwright.config";

test.use({
  storageState: user1Context.path,
});

test.beforeEach(async ({ page }) => {
  await loadIdeationPage(page, `${BASE_URL}/ideas`);
});

test("multiple users voting with page reloads", async ({ page, browser }) => {
  const user1Page = page;

  await generateAndVerifyIdea(
    user1Page,
    "Applications of Generative AI in healthcare",
  );
  // Get the URL of the idea
  const ideaURL = user1Page.url();

  // Test user1 voting down, Reload page and check if vote is saved
  await clickVotingButton(user1Page, VOTE.DOWN);
  await loadIdeationPage(user1Page, ideaURL);
  await expectVotingToBe(user1Page, VOTE.DOWN);

  // Test removing vote by clicking DOWN again, Reload page and check if vote is removed
  await clickVotingButton(user1Page, VOTE.DOWN);
  await loadIdeationPage(user1Page, ideaURL);
  await expectVotingToBe(user1Page, VOTE.NONE);

  // Test user 1 voting up, Reload page and check if vote is saved
  await clickVotingButton(user1Page, VOTE.UP);
  await loadIdeationPage(user1Page, ideaURL);
  await expectVotingToBe(user1Page, VOTE.UP);

  // Make the idea public
  await updateIdeaIsPrivate(user1Page, false);
  await waitForIdeaSave(user1Page);

  //start testing with user2
  const user2BrowserContext = await browser.newContext({
    storageState: user2Context.path,
  });
  const user2Page = await user2BrowserContext.newPage();

  //  user2 navigates to the idea
  await loadIdeationPage(user2Page, ideaURL);

  //  user2 votes down
  await clickVotingButton(user2Page, VOTE.DOWN);

  // Verify that user1 vote is still up
  await loadIdeationPage(user1Page, ideaURL);
  await expectVotingToBe(user1Page, VOTE.UP);

  // Verify that user2 vote is still down
  await loadIdeationPage(user2Page, ideaURL);
  await expectVotingToBe(user2Page, VOTE.DOWN);

  //user1 changes vote to down
  await clickVotingButton(user1Page, VOTE.DOWN);

  // Verify that user2 vote is still down
  await loadIdeationPage(user2Page, ideaURL);
  await expectVotingToBe(user2Page, VOTE.DOWN);

  // user2 removes their vote by clicking DOWN again
  await clickVotingButton(user2Page, VOTE.DOWN);

  // Verify that first user's vote is still down
  await loadIdeationPage(user1Page, ideaURL);
  await expectVotingToBe(user1Page, VOTE.DOWN);

  // Verify that user2's vote is removed
  await loadIdeationPage(user2Page, ideaURL);
  await expectVotingToBe(user2Page, VOTE.NONE);
});
