import { test } from "@playwright/test";
import {
  generateAndVerifyIdea,
  loadIdeationPage,
  updateIdeaIsPrivate,
  waitForIdeaSave,
} from "./steps/ideations";
import {
  gotoAddPeerReview,
  expectSubmitPeerReviewButtonToExist,
  expectSubmitPeerReviewButtonToNotExist,
  expectNthPeerReviewToBe,
  fillAndSavePeerReview,
  editNthPeerReview,
  deleteNthPeerReview,
  expectNthPeerReviewToNotExist,
} from "./steps/review";
import {
  user1Context,
  user2Context,
  anonymousUserContext,
  BASE_URL,
} from "../playwright.config";
import { getUserEmailForPage } from "./steps/email";

test.use({
  storageState: user1Context.path,
});

test.beforeEach(async ({ page }) => {
  await loadIdeationPage(page, `${BASE_URL}/ideas`);
});

test("multi user peer review", async ({ page: user1Page, browser }) => {
  await generateAndVerifyIdea(
    user1Page,
    "Applications of Generative AI in healthcare",
  );
  // Get the URL of the idea
  const ideaURL = user1Page.url();

  await loadIdeationPage(user1Page, ideaURL);
  await gotoAddPeerReview(user1Page);
  await expectSubmitPeerReviewButtonToExist(user1Page);

  const user1PeerReview0 = {
    userEmail: await getUserEmailForPage(user1Page),
    comments: "This is a user1 review0",
  };

  const user1PeerReview1 = {
    userEmail: await getUserEmailForPage(user1Page),
    comments: "This is a user1 review1",
  };

  await fillAndSavePeerReview(user1Page, user1PeerReview0);
  await fillAndSavePeerReview(user1Page, user1PeerReview1);

  await loadIdeationPage(user1Page, ideaURL);
  //latest reviews are shown are shown first (reverse chronological order)
  await expectNthPeerReviewToBe(user1Page, 0, user1PeerReview1);
  await expectNthPeerReviewToBe(user1Page, 1, user1PeerReview0);

  //edit peer review
  user1PeerReview1.comments = "This is user1 edited review1";
  await editNthPeerReview(user1Page, 0, user1PeerReview1);

  user1PeerReview0.comments = "This is user1 edited review0";
  await editNthPeerReview(user1Page, 1, user1PeerReview0);

  await loadIdeationPage(user1Page, ideaURL);
  //now since we edited review1 it should be shown first
  await expectNthPeerReviewToBe(user1Page, 1, user1PeerReview1);
  await expectNthPeerReviewToBe(user1Page, 0, user1PeerReview0);

  //make idea public
  await updateIdeaIsPrivate(user1Page, false);
  await waitForIdeaSave(user1Page);

  //try to open idea with anonymous user and user2
  const anonymousUserBrowserContext = await browser.newContext({
    storageState: anonymousUserContext.path,
  });
  const anonymousUserPage = await anonymousUserBrowserContext.newPage();
  await loadIdeationPage(anonymousUserPage, ideaURL);
  //anonymous user should not see the submit peer review button
  await expectSubmitPeerReviewButtonToNotExist(anonymousUserPage);

  const user2BrowserContext = await browser.newContext({
    storageState: user2Context.path,
  });
  const user2Page = await user2BrowserContext.newPage();
  await loadIdeationPage(user2Page, ideaURL);
  //user2 should see the submit peer review button
  await expectSubmitPeerReviewButtonToExist(user2Page);

  //user2 should see user1's reviews
  await expectNthPeerReviewToBe(user2Page, 1, user1PeerReview1);
  await expectNthPeerReviewToBe(user2Page, 0, user1PeerReview0);

  const user2PeerReview0 = {
    userEmail: await getUserEmailForPage(user2Page),
    comments: "This is a user2 review0",
  };

  //user2 submits his own review
  await fillAndSavePeerReview(user2Page, user2PeerReview0);
  //user2 should see his own review
  await loadIdeationPage(user2Page, ideaURL);
  await expectNthPeerReviewToBe(user2Page, 0, user2PeerReview0);
  //user1 should also see user2's review
  await loadIdeationPage(user1Page, ideaURL);
  await expectNthPeerReviewToBe(user1Page, 0, user2PeerReview0);

  //user1 delete his first review and should not see it event after reload
  await deleteNthPeerReview(user1Page, 1, user1PeerReview0);
  await expectNthPeerReviewToNotExist(user1Page, 1, user1PeerReview0);
  await loadIdeationPage(user1Page, ideaURL);
  await expectNthPeerReviewToNotExist(user1Page, 1, user1PeerReview0);

  //user2 should not see user1's deleted review
  await loadIdeationPage(user2Page, ideaURL);
  await expectNthPeerReviewToNotExist(user2Page, 1, user2PeerReview0);

  //make idea private
  await updateIdeaIsPrivate(user1Page, true);
  await waitForIdeaSave(user1Page);
  await loadIdeationPage(user2Page, ideaURL);
  //user2 should not see the submit peer review button
  await expectSubmitPeerReviewButtonToNotExist(user2Page);
});
