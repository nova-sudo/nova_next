import { expect } from "@playwright/test";
import { getIsPrivateFeatureFlag } from "./profile";
import {
  expectVotingButtonToExist,
  expectVotingButtonToNotExist,
} from "./voting";
import { getIsUnlimitedCreditsFeatureFlag } from "./profile";
const isUnlimitedCredits = await getIsUnlimitedCreditsFeatureFlag();
export async function clickThinkButton(page) {
  const thinkButton = await expectThinkButtonToBeVisible(page);
  await thinkButton.click();
}

//verify that the think button is visible and return it
export async function expectThinkButtonToBeVisible(page) {
  const thinkButton = page.getByRole("button", { name: "Think" });
  await expect(thinkButton).toBeVisible();
  return thinkButton;
}

export async function expectLoadingButtonToNotExist(page) {
  const loadingButton = page.getByRole("button", { name: "Loading..." });
  await expect(loadingButton).toHaveCount(0);
}

export async function expectLoadingButtonToBeVisible(page) {
  const loadingButton = page.getByRole("button", { name: "Loading..." });
  await expect(loadingButton).toBeVisible();
}

export async function loadIdeationPage(page, url) {
  await page.goto(url);
  // we should wait for loading button then think button (which means loading is done)
  // but sometimes loading button appears/disappears quickly that playwright don't catch it
  // in some other cases it is not rendered completely (for ex: user not authorized to view idea)
  // and in very slow test environments the think button appears (initially) then loading button
  // start appearing so to handle all these cases, we wait for 1 second for the page to stabilize
  await page.waitForTimeout(1000);
  await expectThinkButtonToBeVisible(page);
}

export async function verifyShareIdea(page) {
  const shareButtonLocator = page.locator("#shareButton");
  await expect(shareButtonLocator).toBeVisible();
  await shareButtonLocator.click();

  const exportToWordButtonLocator = page.locator("#exportToWordButton");
  await expect(exportToWordButtonLocator).toBeVisible();
  await exportToWordButtonLocator.click();

  const redditShareButtonLocator = page.locator("#redditShareButton");
  await expect(redditShareButtonLocator).toBeVisible();

  const redditSharePagePromise = page.waitForEvent("popup");
  await redditShareButtonLocator.click();
  const redditSharePage = await redditSharePagePromise;

  //check that page title is reddit
  //this is blocked when run by github actions
  //await expect(redditSharePage).toHaveTitle(/reddit/i);
  await redditSharePage.close();

  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

  const copyLinkButtonLocator = page.locator("#copyLinkButton");
  await expect(copyLinkButtonLocator).toBeVisible();
  await copyLinkButtonLocator.click();

  // Read from clipboard
  const ideaURL = await page.evaluate(() => navigator.clipboard.readText());
  //check if ideaURL is the same as current page url
  await expect(page.getByText("Link copied successfully!")).toBeVisible();
  expect(ideaURL).toEqual(page.url());
}

export async function updateIdeaField(page, fieldName, fieldNewText) {
  //get and click edit button
  const editButton = page
    .locator(`#${fieldName}Editor`)
    .getByLabel("Edit code (ctrl + 7)");
  await expect(editButton).toBeVisible();
  await editButton.click();

  const textarea = page.locator(`#${fieldName}Editor textarea`);
  await expect(textarea).toBeVisible();
  await textarea.fill(fieldNewText);

  //get and click preview button
  const previewButton = page
    .locator(`#${fieldName}Editor`)
    .getByLabel("Preview code (ctrl + 9)");
  await expect(previewButton).toBeVisible();
  await previewButton.click();
}

export async function waitForIdeaSave(page) {
  //wait 6 seconds for the autosave to finish
  await page.waitForTimeout(6000);
}

export async function expectTopicsBoxesToBe(page, topics) {
  //verify that topics box are displayed properly inside tag boxes
  for (let i = 0; i < topics.length; i++) {
    await expect(page.locator(`#topicBox${i}`)).toBeVisible();
    await expect(page.locator(`#topicBox${i}`)).toHaveText(topics[i] + "×");
  }
}

export async function expectTopicsFieldToBe(page, topics) {
  const titleTopicsLocator = page.locator(`#currentTopic`);
  await expect(titleTopicsLocator).toBeVisible();

  let expectedValue;
  const isEmptyOrWhitespace =
    topics.length === 0 || topics.every((topic) => !topic.trim());

  if (isEmptyOrWhitespace) {
    expectedValue = "";
  } else {
    expectedValue = topics.join(", ");
  }
}

/**
 * Checks if the specified idea field has the expected text.
 *
 * @param {Page} page - The page object representing the current browser page.
 * @param {string} fieldName - The name of the idea field.
 * @param {string} fieldNewText - The expected text for the idea field (can be regex).
 */
export async function expectIdeaFieldToHaveText(page, fieldName, fieldNewText) {
  const fieldLocator = page.locator(`#${fieldName}Editor p`).first();
  await expect(fieldLocator).toBeVisible();
  await expect(fieldLocator).toHaveText(fieldNewText);
}

export async function expectIdeaFieldToNotExist(page, fieldName) {
  const fieldLocator = page.locator(`#${fieldName}Editor`);
  await expect(fieldLocator).toHaveCount(0);
}

export async function editCitationAtIndex(
  page,
  index,
  title,
  authors,
  summary,
) {
  //get and click edit button
  const editButton = page.locator(`#editCitation${index}`);
  await expect(editButton).toBeVisible();
  await editButton.click();

  const titleInput = page.locator(`#citationTitleTextArea`);
  await expect(titleInput).toBeVisible();
  await titleInput.fill(title);

  const authorsInput = page.locator(`#citationAuthorsTextArea`);
  await expect(authorsInput).toBeVisible();
  await authorsInput.fill(authors);

  const summaryInput = page.locator(`#citationSummaryTextArea`);
  await expect(summaryInput).toBeVisible();
  await summaryInput.fill(summary);

  //get and click save button
  const saveButton = page.locator(`#saveCitation${index}`);
  await expect(saveButton).toBeVisible();
  await saveButton.click();
}

export async function deleteCitationAtIndex(page, index) {
  //get and click delete button
  const deleteButton = page.locator(`#deleteCitation${index}`);
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();
  const popupDeleteButton = page.locator("#popupDeleteButton");
  await popupDeleteButton.click();
}

export async function expectCitationToBe(page, index, title, authors, summary) {
  const titleLocator = page.locator(`#titleCitation${index}`);
  await expect(titleLocator).toBeVisible();
  await expect(titleLocator).toHaveText(title);

  const authorsLocator = page.locator(`#authorsCitation${index}`);
  await expect(authorsLocator).toBeVisible();
  await expect(authorsLocator).toHaveText(authors);

  const summaryLocator = page.locator(`#summaryCitation${index}`);
  await expect(summaryLocator).toBeVisible();
  await expect(summaryLocator).toHaveText(summary);
}

export async function expectCitationAtIndexNotToBe(
  page,
  index,
  title,
  authors,
  summary,
) {
  const titleLocator = page.locator(`#titleCitation${index}`);
  await expect(titleLocator).toBeVisible();
  await expect(titleLocator).not.toHaveText(title);

  const authorsLocator = page.locator(`#authorsCitation${index}`);
  await expect(authorsLocator).toBeVisible();
  await expect(authorsLocator).not.toHaveText(authors);

  const summaryLocator = page.locator(`#summaryCitation${index}`);
  await expect(summaryLocator).toBeVisible();
  await expect(summaryLocator).not.toHaveText(summary);
}

export async function fillProblem(page, problem) {
  await page.getByRole("textbox", { name: "problem" }).fill(problem);
}

export async function fillResearchAreas(
  page,
  researchAreas = [],
  pressEnter = true,
) {
  const areasInput = page.locator("#areas");
  await expect(areasInput).toBeVisible();
  if (pressEnter) {
    for (const area of researchAreas) {
      await areasInput.fill(area);
      await areasInput.press("Enter");
    }
  } else {
    await areasInput.fill(researchAreas.join(", "));
  }
}

export async function updateTopics(page, topics) {
  const topicsInput = page.locator("#currentTopic");
  await expect(topicsInput).toBeVisible();
  await topicsInput.fill(topics.join(", "));
}

export async function isPrivateSwitchChecked(page) {
  //we have to do css check as the mui switch does not update the underlying input checkbox!
  const isChecked = await page
    .locator("#privateSwitch .MuiSwitch-switchBase")
    .getAttribute("class")
    .then((classes) => classes?.includes("Mui-checked"));
  return isChecked;
}

export async function expectIsPrivateToBe(page, isPrivate) {
  const privateSwitchChecked = await isPrivateSwitchChecked(page);
  expect(privateSwitchChecked).toEqual(isPrivate);
}

export async function updateIdeaIsPrivate(page, isPrivate) {
  const privateSwitchChecked = await isPrivateSwitchChecked(page);
  if (privateSwitchChecked != isPrivate) {
    const privateSwitch = page.locator("#privateSwitch");
    await privateSwitch.click();
    await waitForIdeaSave(page);
  }
}

export async function generateAndVerifyIdea(
  page,
  problem,
  researchAreas = [],
  pressEnterWhenFillingResearchAreas = true,
) {
  await expectIsPrivateToBe(page, await getIsPrivateFeatureFlag());

  await fillProblem(page, problem);
  await fillResearchAreas(
    page,
    researchAreas,
    pressEnterWhenFillingResearchAreas,
  );

  await clickThinkButton(page);
  await expectLoadingButtonToBeVisible(page);

  await expectTopicsBoxesToBe(page, researchAreas);

  await expectIdeaFieldsToBeNotEmpty(page, true);

  //topics field are set when generation completes
  await expectTopicsFieldToBe(page, researchAreas);

  await expectIsPrivateToBe(page, await getIsPrivateFeatureFlag());

  //wait for loading to finish
  await expectThinkButtonToBeVisible(page);
}

export async function expectIdeaFieldsToBeNotEmpty(
  page,
  validateMetadata = false,
) {
  await expectIdeaFieldToHaveText(page, "summary", /./);
  await expectIdeaFieldToHaveText(page, "title", /./);
}

export async function expectIdeaFieldsToNotExist(page) {
  await expectIdeaFieldToNotExist(page, "summary");
  await expectIdeaFieldToNotExist(page, "title");
}

export async function verifyUserCanViewIdeaNoEdit(
  userPage,
  ideaURL,
  anonymous = false,
) {
  await loadIdeationPage(userPage, ideaURL);

  //No need to validate generation of metadata since we already validated it before (now we simply can't)
  //TODO: refactor this to use the new metadata validation code
  await expectIdeaFieldsToBeNotEmpty(userPage, false);
  await expectEditButtonsToNotExist(userPage);

  if (anonymous) {
    //anonymous user should not be able to vote
    await expectVotingButtonToNotExist(userPage);
  } else {
    //only logged in user should be able to vote
    await expectVotingButtonToExist(userPage);
  }
  await expectPrivateSwitchToNotExist(userPage);
}

export async function verifyUserCanNotViewIdea(userPage, ideaURL) {
  //don't use loadIdeationPage the idea, just go to the page (as loading button will not appear)
  await userPage.goto(ideaURL);
  await expect(
    userPage.getByText("Forbidden - You are not allowed to view this idea."),
  ).toBeVisible();

  await expectLoadingButtonToNotExist(userPage);
  await expectIdeaFieldsToNotExist(userPage);
  await expectEditButtonsToNotExist(userPage);
  await expectVotingButtonToNotExist(userPage);
  //privacy switch will be visible as use can create a new idea
}

export async function getCurrentCredits(page) {
  const creditTextElement = await page.getByText("You have");
  // Retrieve the text content of the element
  const creditText = await creditTextElement.textContent();
  // Regular expression to match the number of credits
  const regex = /You have (\d+(\.\d+)?) credits /;
  return parseInt(creditText.match(regex)[1]);
}

export async function expectPrivateSwitchToNotExist(page) {
  await expect(page.locator("#privateSwitch")).not.toBeVisible();
}

// ideation.js
export const openSideMenu = async (page) => {
  const menuButton = page.getByTestId("menuButton");
  const sideMenu = page.getByTestId("sideMenu");

  // Open the menu if it is hidden
  if (await sideMenu.isHidden()) {
    await menuButton.click();
    await expect(menuButton).toBeVisible();
  }
};

export const navigateToTopicPage = async (page, topicName) => {
  const topicLink = page.getByTestId(topicName, { exact: true });
  await topicLink.click();
};

export const verifyIdeaOnTopicPage = async (page, problemDescription) => {
  // Find rows in the Ag-Grid and locate the one containing the problem description
  const rows = page.locator(".ag-center-cols-container .ag-row");
  const ideaRow = rows.locator(
    `.ag-cell[col-id="input_problem"]:has-text("${problemDescription}")`,
  );
  await ideaRow.isVisible();
};

//collapsible elements
export const getButtonLocator = (sectionID) =>
  `[data-testid="${sectionID}-collapse"]`;
export const getEditorLocator = (sectionID) =>
  `[data-testid="${sectionID}-content"]`;

export const toggleSection = async (page, sectionID) => {
  const button = page.locator(getButtonLocator(sectionID));
  await button.click();
  return page.locator(getEditorLocator(sectionID));
};
export const expectSectionState = async (page, sectionID, isExpanded) => {
  const content = page.locator(getEditorLocator(sectionID));
  await expect(content).toBeVisible({ visible: isExpanded });
};

export async function expectEditButtonsToNotExist(page) {
  const editSummaryButton = page
    .locator(`#summaryEditor`)
    .getByLabel("Edit code (ctrl + 7)");
  await expect(editSummaryButton).not.toBeAttached();

  const editTitleButton = page
    .locator(`#titleEditor`)
    .getByLabel("Edit code (ctrl + 7)");
  await expect(editTitleButton).not.toBeAttached();

  //just check that first citation does not have edit button
  //any valid idea must have at least one citation or more
  const editCitationButton = page.locator(`#editCitation0`);
  await expect(editCitationButton).not.toBeAttached();
}
