import { createThumbnail, dataURLtoBlob } from "../utils";
import { ensure_user_session, fetch_user_id } from "./authenticate";
import { save_image } from "./storage";
import supabase from "./supabase_init";
import { Database } from "../../types/database";
import { BookmarkInsert, BookmarkRow } from "@/types/bookmark";

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

  return bookmarks as BookmarkRow[];
};

const process_bookmark = async (bookmark: BookmarkInsert, captured: string) => {
  const user_id = await fetch_user_id();
  try {
    const blob = dataURLtoBlob(captured);
    const fileName = `${Date.now()}.png`;
    const path = `${user_id}/${fileName}`;
    const thumbnail = await createThumbnail(blob);
    if (!thumbnail) {
      throw new Error("Failed to create thumbnail.");
    }
    console.log("thumbnail:", thumbnail);
    await save_image(thumbnail, path);

    const bookmarks : BookmarkRow[] = await insert_bookmark({
      ...bookmark,
      thumbnail: path,
      user_id: user_id,
    });
    return bookmarks;
  } catch (error) {
    console.error("Error processing bookmark:", error);
    throw error;
  }
};

const insert_bookmark = async (
  bookmark: BookmarkInsert
) => {
  const {
    data: bookmarks,
    error,
    status,
  } = await supabase.from("bookmarks").insert(bookmark).select();

  if (error) {
    throw new Error(`Supabase error (${status}): ${error.message}`);
  }

  return bookmarks as BookmarkRow[];
};

export { fetch_bookmarks, process_bookmark };
