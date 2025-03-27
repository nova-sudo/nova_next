import { expect } from "@playwright/test";

export async function expectSubmitPeerReviewButtonToExist(page) {
  const submitPeerReviewButton = page.getByRole("button", {
    name: "Submit Peer Review",
  });
  await expect(submitPeerReviewButton).toBeVisible();
  return submitPeerReviewButton;
}

export async function expectSubmitPeerReviewButtonToNotExist(page) {
  const submitPeerReviewButton = page.getByRole("button", {
    name: "Submit Peer Review",
  });
  await expect(submitPeerReviewButton).toHaveCount(0);
}

export async function gotoAddPeerReview(page) {
  const gotoAddPeerReviewButton = page.locator("#gotoAddPeerReviewButton");
  await expect(gotoAddPeerReviewButton).toBeVisible();
  await gotoAddPeerReviewButton.click();
}

export async function fillAndSavePeerReview(page, peerReview) {
  const saveButton = page.locator(`#savePeerReviewButton`);
  await expect(saveButton).toBeVisible();
  await expect(saveButton).toBeDisabled();

  const commentsEditor = page
    .locator("#peer-review-comments")
    .getByRole("textbox");
  await commentsEditor.fill(peerReview.comments);

  //once we edit something the save button should be enabled
  await expect(saveButton).toBeEnabled();

  await saveButton.click();
  await expect(page.getByText("Peer Review saved successfully!")).toBeVisible();
  // Wait for the alert to disappear so we can await to save another peer review correctly
  await expect(page.getByText("Peer Review saved successfully!")).toBeHidden();
}

//find the nth peer review for peerReview.userEmail (user can have multiple reviews)
//and check if it has the expected comments
export async function expectNthPeerReviewToBe(page, index, peerReview) {
  const peerReviewLocator = page
    .locator(`[id^="${peerReview.userEmail}"]`)
    .nth(index);

  await expect(peerReviewLocator.getByText(peerReview.comments)).toBeVisible();
}

export async function expectNthPeerReviewToNotExist(page, index, peerReview) {
  //implement this function
  const peerReviewLocator = page
    .locator(`[id^="${peerReview.userEmail}"]`)
    .nth(index);

  await expect(peerReviewLocator).not.toBeVisible();
}


export async function editNthPeerReview(page, index, peerReview) {
  const peerReviewLocator = page
    .locator(`[id^="${peerReview.userEmail}"]`)
    .nth(index);

  const editButton = peerReviewLocator.locator(`[name="editButton"]`);
  await editButton.click();

  //TODO: reuse this code in fillAndSavePeerReview
  const saveButton = peerReviewLocator.locator(`#savePeerReviewButton`);
  await expect(saveButton).toBeVisible();
  await expect(saveButton).toBeEnabled();

  const commentsEditor = peerReviewLocator
    .locator("#peer-review-comments")
    .getByRole("textbox");
  await commentsEditor.fill(peerReview.comments);

  //once we edit something the save button should be enabled
  await expect(saveButton).toBeEnabled();

  await saveButton.click();

  await expect(page.getByText("Peer Review saved successfully!")).toBeVisible();
  // Wait for the alert to disappear so we can await to save another peer review correctly
  await expect(page.getByText("Peer Review saved successfully!")).toBeHidden();
}

export async function deleteNthPeerReview(page, index, peerReview) {
  const peerReviewLocator = page
    .locator(`[id^="${peerReview.userEmail}"]`)
    .nth(index);

  const deleteButton = peerReviewLocator.locator(`[name="deleteButton"]`);
  await expect(deleteButton).toBeVisible();

  //accept the confirmation dialog which is a normal alert
  //must register the dialog handler before clicking the button
  await page.once("dialog", async (dialog) => {
    expect(dialog.message()).toBe(
      "Are you sure you want to delete this peer review?",
    );
    await page.waitForTimeout(1000); // wait for the dialog to be visible as this is flaky
    await dialog.accept();
  });
  await deleteButton.click();

  await expect(
    page.getByText("Peer Review deleted successfully!"),
  ).toBeVisible();
  // Wait for the alert to disappear so we can await to delete another peer review correctly
  await expect(
    page.getByText("Peer Review deleted successfully!"),
  ).toBeHidden();
}
