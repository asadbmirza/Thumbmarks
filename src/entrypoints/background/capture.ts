import { process_bookmark } from "@/lib/supabase/bookmark";
import { Result } from "../shared/utils";
import { trigger_show_notification } from "./trigger_show_notification";
import { BookmarkInsert } from "@/types/bookmark";

const capture_webpage = async () => {
  const captured = await chrome.tabs.captureVisibleTab();
  if (captured) {
    //save_image(captured);
    await trigger_show_notification(
      "Succesfully captured screen",
      Result.Success,
      3000
    );
    const bookmark : BookmarkInsert = {
      title: "",
      thumbnail: "temp",
      url: "temp",
      notes: "",
      scroll_x: 0,
      scroll_y: 0,
    };
    await process_bookmark(bookmark, captured);
  } else {
    await trigger_show_notification(
      "Failed to capture screen",
      Result.Error,
      3000
    );
  }
};

export { capture_webpage };
