import { createThumbnail, dataURLtoBlob } from "../../utils";
import { fetch_user_id } from "../setup/authenticate";
import { save_image } from "../setup/storage";
import supabase from "../setup/supabase_init";
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

    const bookmarks: BookmarkRow[] = await insert_bookmark({
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

const insert_bookmark = async (bookmark: BookmarkInsert) => {
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

const delete_bookmark = async (id: string, thumbnail?: string) => {
  const user_id = await fetch_user_id();

  const { data, error, status } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", user_id)
    .select();

  if (error) {
    throw new Error(`Supabase error (${status}): ${error.message}`);
  }

  if (thumbnail) {
    const { error: storageError } = await supabase.storage
      .from("thumbnails")
      .remove([thumbnail]);

    if (storageError) {
      throw new Error(`Failed to delete thumbnail: ${storageError.message}`);
    }
  }
  console.log("Deleted bookmark data:", data);
  if (data) {
    return data;
  }
};

const update_bookmark = async (bookmark: BookmarkRow, oldThumbnail: string) => {
  const user_id = await fetch_user_id();

  const {
    data: updatedBookmarks,
    error,
    status,
  } = await supabase
    .from("bookmarks")
    .update(bookmark)
    .eq("id", bookmark.id)
    .eq("user_id", user_id)
    .select();

  if (error) {
    throw new Error(`Supabase error (${status}): ${error.message}`);
  }

  if (oldThumbnail && oldThumbnail !== bookmark.thumbnail) {
    await supabase.storage.from("thumbnails").remove([oldThumbnail]);
  }

  return updatedBookmarks as BookmarkRow[];
};

export { fetch_bookmarks, process_bookmark, delete_bookmark, update_bookmark };
