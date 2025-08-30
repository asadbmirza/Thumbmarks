import { ensure_user_session } from "@/lib/supabase/setup/authenticate";
import {
  BackgroundMessageType,
  BackgroundMessageTypeFunction,
  Message,
} from "../shared/message_types";
import { capture_webpage } from "./capture";
import {
  delete_bookmark,
  fetch_bookmarks,
  update_bookmark,
} from "@/lib/supabase/operations/bookmark";
import { BookmarkRow } from "@/types/bookmark";
import navigate_to_bookmark from "./navigate";

const messageTypeFunction: BackgroundMessageTypeFunction = {
  [BackgroundMessageType.CaptureScreen]: async () => await capture_webpage(),
  [BackgroundMessageType.DeleteBookmark]: async (payload) =>
    await delete_bookmark(payload.id, payload?.thumbnail),
  [BackgroundMessageType.UpdateBookmark]: async (payload) =>
    await update_bookmark(payload.bookmark, payload?.oldThumbnail),
  [BackgroundMessageType.GetBookmarks]: async () => await fetch_bookmarks(),
  [BackgroundMessageType.NavigateToBookmark]: (payload) =>
    navigate_to_bookmark(payload.url, payload.scrollX, payload.scrollY),
};

chrome.runtime.onInstalled.addListener(async (details) => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  if (details.reason === "install") {
    console.log("Thumbmark Extension: First-time installation detected.");
    try {
      const user_id = await ensure_user_session();
    } catch (err) {
      console.error("Error occurred during installation:", err);
    }
  }

  chrome.contextMenus.create({
    id: "saveVisualBookmark",
    title: "Save Visual Bookmark",
    contexts: ["page", "selection", "link"],
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const user_id = await ensure_user_session();
    if (info.menuItemId === "saveVisualBookmark" && user_id) {
      try {
        const newBookmarks: BookmarkRow[] = (await capture_webpage()) ?? [];

        chrome.runtime.sendMessage({
          type: BackgroundMessageType.CaptureScreen,
          payload: newBookmarks,
        });

      } catch (error) {
        console.error("Error capturing webpage from context menu:", error);
      }
    }
  });
});

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse) => {
      const handleMessage = async () => {
        try {
          const handler =
            messageTypeFunction[message.type as BackgroundMessageType];
          let returnValue = null;
          console.log("Message received:", message);

          if (handler && message?.payload) {
            returnValue = await handler(message.payload);
          } else if (handler) {
            returnValue = await (handler as () => Promise<any>)();
          }

          sendResponse({ status: "done", data: returnValue });
        } catch (error) {
          console.error("Background script error:", error);
          sendResponse({ status: "error", error: error });
        }
      };

      handleMessage();
      return true; 
    }
  );
});
