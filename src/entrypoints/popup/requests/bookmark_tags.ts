import { BackgroundMessageType } from "@/entrypoints/shared/message_types";
import { BookmarkTagRow } from "@/types/bookmark_tags.types";

const fetch_all_user_tags = async (filter: string[]): Promise<BookmarkTagRow[]> => {
  try {
    const response = await chrome.runtime.sendMessage({
      type: BackgroundMessageType.FetchAllUserTags,
      payload: {
        filter: filter,
      },
    });
    if (response.status === "done" && response.data) {
      return response.data as BookmarkTagRow[];
    }
  } catch (error) {
    console.error("Error fetching all user tags:", error);
  }
  return [];
};

//TODO: migrate all bookmark_tags related requests here
export { fetch_all_user_tags };
