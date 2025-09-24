import {
  ContentMessageType,
  ContentMessageTypeFunction,
  Message,
} from "../shared/message_types";
import get_scroll_data from "./scroll/scroll_data";

const messageTypeFunction: ContentMessageTypeFunction = {
  [ContentMessageType.GetScrollData]: get_scroll_data,
};

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
      const handler = messageTypeFunction[message.type as ContentMessageType];
      let returnValue = handler ? handler() : null;
      
      sendResponse({ status: "done", data: returnValue });
    });
  },
});
