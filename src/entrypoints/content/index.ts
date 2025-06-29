import {
  ContentMessageType,
  ContentMessageTypeFunction,
  Message,
} from "../shared/message_types";
import { show_notification } from "./show_notification";

const messageTypeFunction: ContentMessageTypeFunction = {
  [ContentMessageType.ShowNotification]: show_notification,
};

export default defineContentScript({
  matches: ["*://*.google.com/*"],
  main() {
    chrome.runtime.onMessage.addListener((message: Message) => {
      const handler = messageTypeFunction[message.type as ContentMessageType];
      if (handler && message?.payload) {
        handler(message.payload);
      }
    });
  },
});
