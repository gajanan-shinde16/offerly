
import { google } from "googleapis";

export const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

export const getGmailAuthUrl = (state) => {
  const oauth2Client = getOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    state
  });
};

export const exchangeAuthCode = async (code) => {
  const oauth2Client = getOAuthClient();

  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  return {
    oauth2Client,
    tokens
  };
};

export const getGmailProfile = async (oauth2Client) => {
  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client
  });

  const response = await gmail.users.getProfile({
    userId: "me"
  });

  return response.data;
};


export const getNewGmailMessages = async (
  oauth2Client,
  lastSyncedAt
) => {
  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client
  });

  
  const query = lastSyncedAt
    ? `after:${Math.floor(
        (new Date(lastSyncedAt).getTime() - 60 * 1000) / 1000
      )}`
    : "newer_than:7d";

 
  const messages = [];
  let pageToken;

  do {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 100,
      pageToken
    });

    messages.push(...(response.data.messages || []));
    pageToken = response.data.nextPageToken;
  } while (pageToken);

  return messages;
};


export const getGmailMessage = async (
  oauth2Client,
  messageId
) => {
  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client
  });

  const response = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full"
  });

  return response.data;
};
