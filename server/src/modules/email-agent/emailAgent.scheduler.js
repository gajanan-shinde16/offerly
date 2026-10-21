
import cron from "node-cron";
import GmailAccount from "../../models/GmailAccount.model.js";
import { processNewEmails } from "./emailProcessing.service.js";

export const startEmailAgentScheduler = () => {
  cron.schedule("*/15 * * * *", async () => {
    console.log("Starting scheduled Gmail sync");

    const accounts = await GmailAccount.find({
      isActive: true
    }).select("userId");

    for (const account of accounts) {
      try {
        await processNewEmails(account.userId.toString());
      } catch (error) {
        console.error(
          `Gmail sync failed for account ${account._id}:`,
          error.message
        );
      }
    }
  });

  console.log("Email agent scheduler started");
};
