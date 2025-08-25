import { ensure_user_session } from "@/lib/supabase/authenticate";
import {
  BackgroundMessageType,
  BackgroundMessageTypeFunction,
  Message,
} from "../shared/message_types";
import { capture_webpage } from "./capture";
import { trigger_show_notification } from "./trigger_show_notification";
import { Result } from "../shared/utils";
import supabase from "@/lib/supabase/supabase_init";

const messageTypeFunction: BackgroundMessageTypeFunction = {
  [BackgroundMessageType.CaptureScreen]: capture_webpage,
};

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    console.log("Thumbmark Extension: First-time installation detected.");
    try {
      const user_id = await ensure_user_session();
      console.log("User ID from ensure_user_session:", user_id);
    } catch (err) {
      console.error("Error occurred during installation:", err);
    }
  }
});

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message: Message) => {
    messageTypeFunction[message.type as BackgroundMessageType]();
  });
});
