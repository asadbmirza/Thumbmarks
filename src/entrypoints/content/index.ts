import {
  ContentMessageType,
  ContentMessageTypeFunction,
  Message,
} from "../shared/message_types";
import { show_notification } from "./notification/show_notification";
import get_scroll_data from "./scroll/scroll_data";

const messageTypeFunction: ContentMessageTypeFunction = {
  [ContentMessageType.ShowNotification]: show_notification,
  [ContentMessageType.GetScrollData]: get_scroll_data,
};

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
      const handler = messageTypeFunction[message.type as ContentMessageType];
      let returnValue = null;
      if (handler && message?.payload) {
        returnValue = handler(message.payload);
      } else if (handler) {
        returnValue = (handler as () => void)();
      }
      sendResponse({ status: "done", data: returnValue });
    });
  },
});
