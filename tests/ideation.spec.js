import { test, expect } from "@playwright/test";
import {
  loadIdeationPage,
  generateAndVerifyIdea,
  fillProblem,
  clickThinkButton,
  fillResearchAreas,
  editCitationAtIndex,
  updateIdeaField,
  updateTopics,
  updateIdeaIsPrivate,
  verifyShareIdea,
  expectCitationToBe,
  expectCitationAtIndexNotToBe,
  expectIdeaFieldToHaveText,
  expectTopicsBoxesToBe,
  expectTopicsFieldToBe,
  deleteCitationAtIndex,
  verifyUserCanViewIdeaNoEdit,
  verifyUserCanNotViewIdea,
  expectThinkButtonToBeVisible,
  waitForIdeaSave,
  toggleSection,
  expectSectionState,
  openSideMenu,
  navigateToTopicPage,
  verifyIdeaOnTopicPage,
} from "./steps/ideations";
import {
  user1Context,
  user2Context,
  anonymousUserContext,
  BASE_URL,
} from "../playwright.config";

test.use({
  storageState: user1Context.path,
});

test.beforeEach(async ({ page }) => {
  await loadIdeationPage(page, `${BASE_URL}/ideas`);
});

//this test generates an idea with no research topic, checks that the topic is present in the "Others" topic page
test("generate idea (problem, 0 research topics), view under 'others' topic", async ({
  page,
  browser,
}) => {
  // Generate and verify an idea with the given description
  await generateAndVerifyIdea(
    page,
    "Applications of Generative AI in healthcare",
  );

  //testing collapsible elements
  // Define sections
  const sections = ["idea-details", "reference", "review"];

  for (const sectionID of sections) {
    // Initial state - check expanded
    await expectSectionState(page, sectionID, true);

    // First click to collapse
    await toggleSection(page, sectionID);
    await expectSectionState(page, sectionID, false);

    // Second click to expand again
    await toggleSection(page, sectionID);
    await expectSectionState(page, sectionID, true);
  }

  // Open the side menu
  await openSideMenu(page);

  const showOnlyMyIdeasCheckbox = page.getByTestId("showOnlyMyIdeasCheckbox");

  // Verify that the checkbox is visible and enabled
  await expect(showOnlyMyIdeasCheckbox).toBeVisible();
  await expect(showOnlyMyIdeasCheckbox).toBeEnabled();
  await showOnlyMyIdeasCheckbox.click();

  //  Navigate to the 'Others' topic page
  await navigateToTopicPage(page, "Others");

  //  Verify that the idea appears under the 'Others' topic page
  await verifyIdeaOnTopicPage(
    page,
    "Applications of Generative AI in healthcare",
  );
});

test("generate idea (problem, 4 research topics)", async ({ page }) => {
  await fillProblem(page, "Applications of Generative AI in healthcare");
  await fillResearchAreas(page, [
    "Generative AI",
    "Healthcare",
    "Data Analysis",
    "Machine Learning",
  ]);
  await expect(page.getByText("You can only add up to 3")).toBeVisible();

  //fill research areas but don't press enter, press think
  await fillResearchAreas(
    page,
    ["Generative AI", "Healthcare", "Data Analysis", "Machine Learning"],
    false,
  );
  await clickThinkButton(page);
  await expect(page.getByText("You can only add up to 3")).toBeVisible();
  await expectThinkButtonToBeVisible(page);
});

test("generate idea (no problem, 3 research topics)", async ({ page }) => {
  await fillResearchAreas(page, [
    "Generative AI",
    "Healthcare",
    "Data Analysis",
  ]);
  await clickThinkButton(page);

  await expect(
    page.getByText("Please enter a problem description"),
  ).toBeVisible();
  await expectThinkButtonToBeVisible(page);
});

test("generate, edit, view idea, share (Primary User Flow)", async ({
  page,
  browser,
}) => {
  // Generate and verify initial idea
  await generateAndVerifyIdea(
    page,
    "Increase wheat yield",
    ["Bioengineering"],
    true,
  );
  const updatedTopics = ["Bioengineering", "Agriculture"];

  // Add new topic and update idea fields
  await updateTopics(page, updatedTopics);
  await updateIdeaField(page, "title", "Updated title");
  await updateIdeaField(page, "summary", "Updated summary");

  // Update citations
  await editCitationAtIndex(
    page,
    0,
    "Updated title",
    "Updated authors",
    "Updated relevance",
  );
  await editCitationAtIndex(
    page,
    1,
    "Updated title2",
    "Updated authors2",
    "Updated relevance2",
  );

  await waitForIdeaSave(page);

  // Verify updated idea details
  const ideaURL = page.url();
  await loadIdeationPage(page, ideaURL);
  await expectTopicsBoxesToBe(page, updatedTopics);
  await expectIdeaFieldToHaveText(page, "title", "Updated title");
  await expectIdeaFieldToHaveText(page, "summary", "Updated summary");

  await expectCitationToBe(
    page,
    0,
    "Updated title",
    "Updated authors",
    "Updated relevance",
  );
  await expectCitationToBe(
    page,
    1,
    "Updated title2",
    "Updated authors2",
    "Updated relevance2",
  );
  await expectTopicsFieldToBe(page, updatedTopics);

  // Test Autosave on deletion of topics
  const deleteTopics = ["Bioengineering", "Agriculture"];
  await updateTopics(page, deleteTopics);
  await waitForIdeaSave(page);
  await loadIdeationPage(page, ideaURL);
  await expectTopicsBoxesToBe(page, deleteTopics);

  // Test deletion of citations
  await deleteCitationAtIndex(page, 1);
  await expectCitationAtIndexNotToBe(
    page,
    1,
    "Updated title2",
    "Updated authors2",
    "Updated relevance2",
  );

  await deleteCitationAtIndex(page, 0);
  await expectCitationAtIndexNotToBe(
    page,
    0,
    "Updated title",
    "Updated authors",
    "Updated relevance",
  );

  // Set idea to private and verify it is not viewable by other users
  await updateIdeaIsPrivate(page, true);
  await waitForIdeaSave(page);

  //reload the page and verify that the citations are deleted
  await loadIdeationPage(page, ideaURL);
  await expectCitationAtIndexNotToBe(
    page,
    1,
    "Updated title2",
    "Updated authors2",
    "Updated relevance2",
  );
  await expectCitationAtIndexNotToBe(
    page,
    0,
    "Updated title",
    "Updated authors",
    "Updated relevance",
  );

  // try to open idea with anonymous user and user2
  const anonymousUserBrowserContext = await browser.newContext({
    storageState: anonymousUserContext.path,
  });
  const anonymousUserPage = await anonymousUserBrowserContext.newPage();

  const user2BrowserContext = await browser.newContext({
    storageState: user2Context.path,
  });
  const user2Page = await user2BrowserContext.newPage();

  await verifyUserCanNotViewIdea(anonymousUserPage, ideaURL);
  await verifyUserCanNotViewIdea(user2Page, ideaURL);

  //now lets change isPrivate to false and try to open it with user2 and anonymous user
  await updateIdeaIsPrivate(page, false);
  await waitForIdeaSave(page);
  await verifyUserCanViewIdeaNoEdit(anonymousUserPage, ideaURL, true);
  await verifyUserCanViewIdeaNoEdit(user2Page, ideaURL, false);

  // Verify sharing functionality
  await verifyShareIdea(page);

  //Open the side menu as an anonymous user
  await openSideMenu(anonymousUserPage);

  //Navigate to the 'Others' topic page as an anonymous user
  await navigateToTopicPage(anonymousUserPage, "Others");

  //Verify that the idea appears under the 'Others' topic page for anonymous user
  await verifyIdeaOnTopicPage(
    anonymousUserPage,
    "Applications of Generative AI in healthcare",
  );

  // Close the anonymous user context
  await anonymousUserBrowserContext.close();
});

test("generate idea, search topic, view in topic page (side menu test)", async ({
  page,
  context,
}) => {
  // Load the ideation page
  await loadIdeationPage(page, `${BASE_URL}/ideas`);

  // Generate an idea with a specific scientific field
  const problemDescription = "The role of AI in the medical field";
  const topics = ["Healthcare"];
  await generateAndVerifyIdea(page, problemDescription, topics);

  //  Open the side menu
  await openSideMenu(page);

  // Locate the side menu item for "Healthcare" and extract the count
  const sideMenuCount = await page
    .getByTestId("Healthcare", { exact: true })
    .evaluate((element) => {
      const text = element.textContent;
      const match = text.match(/\[(\d+)\]/); // Regex to extract the number in square brackets
      return match ? parseInt(match[1], 10) : null;
    });
  console.log("sideMenuCount", sideMenuCount);

  await navigateToTopicPage(page, "Healthcare");

  // // Verify the idea is visible in the ag-Grid on the topic page
  // await verifyIdeaOnTopicPage(page, problemDescription);

  const firstTitleLink = page.locator('[data-cell-id="0_current_title"]');

  // Ensure the link is visible
  await firstTitleLink.isVisible();

});

test("Scientific areas suggestion dropdown", async ({ page }) => {
  // Load the ideation page
  await loadIdeationPage(page, `${BASE_URL}/ideas`);

  await page.getByTestId("scientificAreasInput").fill("Healthcare");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");

  await page.getByTestId("scientificAreasInput").fill("Bioengineering");
  await page.keyboard.press("Tab");

  await page.getByTestId("scientificAreasInput").fill("Agriculture");
  await page.keyboard.press("Tab");

  // Testing if the suggestions were saved correctly
  await expect(page.locator("#topicBox0")).toContainText("Healthcare");
  await expect(page.locator("#topicBox1")).toContainText("Bioengineering");
  await expect(page.locator("#topicBox2")).toContainText("Agriculture");
});

test("anonymous user can't generate idea", async ({ browser }) => {
  const anonymousUserBrowserContext = await browser.newContext({
    storageState: anonymousUserContext.path,
  });
  const anonymousUserPage = await anonymousUserBrowserContext.newPage();
  // Load the ideation page
  await loadIdeationPage(anonymousUserPage, `${BASE_URL}/ideas`);

  await expect(anonymousUserPage.locator("#problem")).toBeDisabled();
  await expect(anonymousUserPage.locator("#areas")).toBeDisabled();
});
