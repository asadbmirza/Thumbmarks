import { fetch_bookmarks, process_bookmark } from "@/lib/supabase/operations/bookmark";
import { Result } from "../shared/utils";
import { trigger_show_notification } from "./trigger_show_notification";
import { BookmarkInsert } from "@/types/bookmark";
import setup_bookmark from "./bookmark";

const capture_webpage = async () => {
  const captured = await chrome.tabs.captureVisibleTab();
  if (captured) {
    //save_image(captured);
    await trigger_show_notification(
      "Succesfully captured screen",
      Result.Success,
      3000
    );
    const bookmark_to_process: BookmarkInsert = await setup_bookmark();

    try {
      let result = await process_bookmark(bookmark_to_process, captured);
      return result;
    } catch (error) {
      console.error("Error processing bookmark:", error);
      trigger_show_notification(
        "Error processing bookmark",
        Result.Error,
        3000
      );
    }
  } else {
    await trigger_show_notification(
      "Failed to capture screen",
      Result.Error,
      3000
    );
  }
  return;
};

export { capture_webpage };
