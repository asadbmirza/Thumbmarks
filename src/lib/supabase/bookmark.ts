import { ensure_user_session, fetch_user_id } from "./authenticate";
import supabase from "./supabase_init";

const fetch_bookmarks = async () => {
  const user_id = await fetch_user_id();
  if (!user_id) {
    throw new Error("User ID not found.");
  }

  const {
    data: bookmarks,
    error,
    status,
  } = await supabase.from("bookmarks").select("*").eq("user_id", user_id);

  if (error) {
    throw new Error(`Supabase error (${status}): ${error.message}`);
  }

  return bookmarks;
};

const process_bookmark = async (bookmark: any, captured: any) => {
  const user_id = await fetch_user_id(); // will auto-create anon user if needed
  try {
    const thumbnail_url = await save_image(captured);
    const bookmarks = await insert_bookmark({
      ...bookmark,
      thumbnail: thumbnail_url,
      user_id: user_id,
    });
    return bookmarks;
  } catch (error) {
    console.error("Error processing bookmark:", error);
    throw error;
  }
};

const insert_bookmark = async (bookmark: any) => {
  const {
    data: bookmarks,
    error,
    status,
  } = await supabase.from("bookmarks").insert(bookmark).select();

  if (error) {
    throw new Error(`Supabase error (${status}): ${error.message}`);
  }

  return bookmarks;
};

export { fetch_bookmarks, process_bookmark };
