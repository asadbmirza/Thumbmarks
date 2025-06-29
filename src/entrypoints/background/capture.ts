import { Result } from "../shared/utils";
import { trigger_show_notification } from "./trigger_show_notification";

const capture_webpage = async () => {
  const captured = await chrome.tabs.captureVisibleTab();
  if (captured) {
    //save_image(captured);
    await trigger_show_notification(
      "Succesfully captured screen",
      Result.Success,
      3000
    );
  } else {
    await trigger_show_notification(
      "Failed to capture screen",
      Result.Error,
      3000
    );
  }
};

export { capture_webpage };
