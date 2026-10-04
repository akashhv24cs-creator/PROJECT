import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
import { SendChatMessageParams, SendChatMessageResponse } from "../types/chat";

/**
 * Helper to safely generate a random UUID v4 in both secure and non-secure browser environments.
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Sends a message to the Zenera AI Travel Assistant via Firebase Cloud Function `chatWithZenera`.
 */
export async function sendChatMessage(
  params: SendChatMessageParams
): Promise<SendChatMessageResponse> {
  const { message, conversationId, uid } = params;

  if (!message || !message.trim()) {
    throw new Error("Please enter a valid message.");
  }

  if (!uid) {
    throw new Error("You must be logged in to chat with Zenera AI.");
  }

  const activeConversationId = conversationId || generateUUID();
  const payload = {
    message: message.trim(),
    conversationId: activeConversationId,
    uid,
  };

  console.log("[AI CHAT] CALLING chatWithZenera with payload:", payload);

  try {
    const chatCallable = httpsCallable<SendChatMessageParams, any>(
      functions,
      "chatWithZenera"
    );

    const result = await chatCallable(payload);

    console.log("[AI CHAT] chatWithZenera RESPONSE:", result);

    const data = result?.data;
    let replyText = "";

    if (data && typeof data.reply === "string") {
      replyText = data.reply;
    } else if (data && data.result && typeof data.result.reply === "string") {
      replyText = data.result.reply;
    } else if (typeof data === "string") {
      replyText = data;
    } else if (data && typeof data.result === "string") {
      replyText = data.result;
    }

    if (replyText && replyText.trim()) {
      return { reply: replyText.trim() };
    }

    return { reply: "No response received from Zenera AI." };
  } catch (error: any) {
    console.error("[AI CHAT] chatWithZenera ERROR:", error);

    const code = error?.code || "";
    let userFriendlyMessage = "Something went wrong on our end. Please try again in a moment.";

    if (code === "unauthenticated" || code === "functions/unauthenticated") {
      userFriendlyMessage = "You need to be logged in to use Zenera AI. Please sign in and try again.";
    } else if (code === "resource-exhausted" || code === "functions/resource-exhausted") {
      userFriendlyMessage = "Daily AI limit reached (50 messages/day). Please come back tomorrow!";
    } else if (code === "invalid-argument" || code === "functions/invalid-argument") {
      userFriendlyMessage = "Your message couldn't be sent. Make sure it is valid and non-empty.";
    } else if (code === "unavailable" || code === "functions/unavailable") {
      userFriendlyMessage = "Zenera AI assistant is currently offline. Please check back shortly.";
    } else if (code === "deadline-exceeded" || code === "functions/deadline-exceeded") {
      userFriendlyMessage = "The request timed out. Please try asking again.";
    } else if (error?.message) {
      userFriendlyMessage = error.message;
    }

    throw new Error(userFriendlyMessage);
  }
}
