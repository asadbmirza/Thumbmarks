import {
  delete_bookmark,
  fetch_bookmarks,
  process_bookmark,
  update_bookmark,
} from "@/lib/supabase/operations/bookmark";
import { ensure_user_session } from "@/lib/supabase/setup/authenticate";
import {
  BackgroundMessageType,
  BackgroundMessageTypeFunction,
  Message,
} from "../shared/message_types";
import get_tab_data from "./bookmark";
import { capture_webpage } from "./capture";
import navigate_to_bookmark from "./navigate";

const messageTypeFunction: BackgroundMessageTypeFunction = {
  [BackgroundMessageType.CaptureScreen]: async () => await capture_webpage(),
  [BackgroundMessageType.DeleteBookmark]: async (payload) =>
    await delete_bookmark(payload.id, payload?.thumbnail),
  [BackgroundMessageType.UpdateBookmark]: async (payload) =>
    await update_bookmark(payload.bookmark, payload?.oldThumbnail),
  [BackgroundMessageType.GetBookmarks]: async () => await fetch_bookmarks(),
  [BackgroundMessageType.ProcessBookmark]: async (payload) =>
    await process_bookmark(payload.bookmark, payload.captured),
  [BackgroundMessageType.NavigateToBookmark]: (payload) =>
    navigate_to_bookmark(payload.url, payload.scrollX, payload.scrollY),
  [BackgroundMessageType.GetTabData]: async () => {
    return await get_tab_data();
  },
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
    title: "Save Thumbmark",
    contexts: ["page", "selection", "link"],
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab || !tab.windowId) return;
    chrome.sidePanel.open({ windowId: tab.windowId });
    const user_id = await ensure_user_session();
    if (info.menuItemId === "saveVisualBookmark" && user_id) {
      try {
        const captured: string = (await capture_webpage()) ?? "";
        const tabData = await get_tab_data();

        chrome.runtime.sendMessage({
          type: "SETUP_BOOKMARK",
          payload: {
            captured,
            tabData,
          },
        });
        chrome.storage.local.set({
          pendingBookmark: {
            captured,
            tabData,
          },
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
        } catch (error: any) {
          console.error("Background script error:", error.message);
          sendResponse({
            status: "error",
            error: { message: error?.message, stack: error?.stack },
          });
        }
      };

      handleMessage();
      return true;
    }
  );
});
