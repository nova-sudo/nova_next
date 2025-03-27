import { expect } from "@playwright/test";
import { VOTE } from "../../src/components/Idea/VoteUpDown";

export async function expectVotingButtonToNotExist(page) {
  await expect(page.locator("#voteUpDownComponent")).not.toBeVisible();
}

export async function expectVotingButtonToExist(page) {
  await expect(page.locator("#voteUpDownComponent")).toBeVisible();
  await expect(page.locator("#voteUpDownComponent")).toBeEnabled();
}

export async function getCurrentVote(page) {
  if (
    (await page.locator("#thumb-up-icon-on").isVisible()) &&
    (await page.locator("#thumb-down-icon-off").isVisible())
  ) {
    return VOTE.UP;
  } else if (
    (await page.locator("#thumb-up-icon-off").isVisible()) &&
    (await page.locator("#thumb-down-icon-on").isVisible())
  ) {
    return VOTE.DOWN;
  } else if (
    (await page.locator("#thumb-up-icon-off").isVisible()) &&
    (await page.locator("#thumb-down-icon-off").isVisible())
  ) {
    return VOTE.NONE;
  }
  throw new Error("Unexpected vote state");
}

export async function clickVotingButton(page, newVote) {
  const currentVote = await getCurrentVote(page);
  const expectedVote = newVote === currentVote ? VOTE.NONE : newVote;

  let selector;
  switch (newVote) {
    case VOTE.UP:
      selector = "#thumb-up-button";
      break;
    case VOTE.DOWN:
      selector = "#thumb-down-button";
      break;
    default:
      throw new Error(`Invalid vote type: ${newVote}`);
  }

  // I want to click the button even if clicked before
  await page.locator(selector).click({ force: true });

  // Wait for the vote to be processed
  await expect(page.getByText("Thank you for your feedback!")).toBeVisible();

  await expectVotingToBe(page, expectedVote);
}

export async function expectVotingToBe(page, expectedVote) {
  const updatedVote = await getCurrentVote(page);
  expect(updatedVote).toEqual(expectedVote);
}
