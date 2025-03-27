import pkg from "@apollo/client";
const { ApolloClient, InMemoryCache, gql } = pkg;

const MAILDROP_API_URL = "https://api.maildrop.cc/graphql";

//disable apollo cache for testing so we always fetch new messages!
const defaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};

const client = new ApolloClient({
  uri: MAILDROP_API_URL,
  cache: new InMemoryCache(),
  defaultOptions: defaultOptions,
});

function generateRandomName(length = 7) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function generateUserEmail() {
  const inboxName = generateRandomName();
  return inboxName + "@maildrop.cc";
}

export async function saveUserEmailForPage(page, userEmail) {
  return await page.evaluate((email) => {
    localStorage.setItem("userEmail", email);
  }, userEmail);
}

export async function getUserEmailForPage(page) {
  return await page.evaluate(() => {
    return localStorage.getItem("userEmail");
  });
}

export async function getLoginLink(userEmail) {
  // Extract the inbox name from the email
  const inboxName = userEmail.split("@")[0];

  const GET_MESSAGES = gql`
    query inbox($mailbox: String!) {
      inbox(mailbox: $mailbox) {
        id
        headerfrom
        subject
        date
      }
    }
  `;

  const GET_MESSAGE_CONTENT = gql`
    query message($mailbox: String!, $id: String!) {
      message(mailbox: $mailbox, id: $id) {
        id
        headerfrom
        subject
        date
        data
        html
      }
    }
  `;

  const DELETE_MESSAGE = gql`
    mutation ($mailbox: String!, $id: String!) {
      delete(mailbox: $mailbox, id: $id)
    }
  `;

  try {
    let foundLink = false;

    while (!foundLink) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 trying/retrying

      const { data } = await client.query({
        query: GET_MESSAGES,
        variables: { mailbox: inboxName },
      });

      if (!data || !data.inbox) {
        console.error("No inbox data returned:", data, ", Retrying...");
        continue;
      }

      const messages = data.inbox;
      if (messages.length === 0) {
        console.log("No messages found in the inbox. Retrying...");
        continue;
      }

      const sortedMessages = data.inbox.sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );
      const latestMessage = sortedMessages[0];
      const { data: messageData } = await client.query({
        query: GET_MESSAGE_CONTENT,
        variables: { mailbox: inboxName, id: latestMessage.id },
      });
      const messageText = messageData.message?.html;

      // Process messageText to find the login link
      const loginLinkMatch = messageText.match(/(https?:\/\/[^"]*auth[^"]*)/g);
      if (!loginLinkMatch?.length) {
        continue;
      }

      // delete message so we don't use it in re-login
      await client.mutate({
        mutation: DELETE_MESSAGE,
        variables: { mailbox: inboxName, id: latestMessage.id },
      });

      console.log("Login link:", loginLinkMatch[1]);
      return loginLinkMatch[1];
    }
  } catch (error) {
    console.error("Error processing emails:", error);
    throw error;
  }
}
