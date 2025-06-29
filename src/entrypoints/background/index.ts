import { BackgroundMessageType, BackgroundMessageTypeFunction, Message } from "../shared/message_types";
import { capture_webpage } from "./capture";

const messageTypeFunction: BackgroundMessageTypeFunction = {
  [BackgroundMessageType.CaptureScreen]: capture_webpage,
};

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message: Message) => {
    messageTypeFunction[message.type as BackgroundMessageType]();
  });
});
