import { BookmarkInsert } from "@/types/bookmark";
import {
  ContentMessageType,
  Message,
  ScrollData,
} from "../shared/message_types";

const get_tab_data = async (): Promise<BookmarkInsert> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";
  const title = tab?.title || "";
  const data = await get_scroll_data(tab);
  console.log("Scroll dataaaaa:", data);
  const { scrollX: scroll_x, scrollY: scroll_y } = data;

  return {
    url,
    title,
    scroll_x,
    scroll_y,
  };
};

const get_scroll_data = (tab: chrome.tabs.Tab): Promise<ScrollData> => {
  const default_scroll_data: ScrollData = {
    scrollX: 0,
    scrollY: 0,
    documentHeight: 0,
    windowHeight: 0,
  };
  if (!tab?.id) {
    console.log("Error finding tab");
    return Promise.resolve(default_scroll_data);
  }

  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.sendMessage<Message>(
        tab.id as number,
        { type: ContentMessageType.GetScrollData },
        (response: {data: ScrollData, status: string}) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
            return resolve(default_scroll_data);
          }
          if (response.status === "done" && response.data) {
            resolve(response.data);
          } else {
            resolve(default_scroll_data);
          }
        }
      );
    } catch (error) {
      console.error("Failed to capture the page", error);
      resolve(default_scroll_data);
    }
  });
};

export default get_tab_data;
