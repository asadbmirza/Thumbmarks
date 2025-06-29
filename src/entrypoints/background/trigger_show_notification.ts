import { ShowNotification } from "../content/show_notification";
import { ContentMessageType, Message } from "../shared/message_types";

const trigger_show_notification = async (
  message: ShowNotification["message"],
  result: ShowNotification["result"],
  duration: ShowNotification["duration"]
) => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.id) {
    console.log("Error finding tab");
    return;
  }

  try {
    await chrome.tabs.sendMessage<Message>(tab.id, {
      type: ContentMessageType.ShowNotification,
      payload: {
        message,
        result,
        duration,
      } as ShowNotification,
    });
  } catch (error) {
    console.error("Failed to display the notification", error);
  }
};

export { trigger_show_notification };
