import { BookmarkTagRow } from "@/types/bookmark_tags.types";
import { fetch_user_id } from "../setup/authenticate";
import supabase from "../setup/supabase_init";

const fetch_bookmark_tags = async (bookmark_id: string) => {
  const { data, error, status } = await supabase
    .from("bookmark_to_tags")
    .select(`bookmark_tags(*)`)
    .eq("bookmark_id", bookmark_id);
  if (error) {
    throw new Error(`Supabase error (${status}): ${error.message}`);
  }
  return (
    (data?.flatMap((item) => item.bookmark_tags) as BookmarkTagRow[]) || []
  );
};

const insert_bookmark_tag = async (bookmark_id: string, label: string) => {
  // Check if tag already exists
  const { data: existingTag, error: fetchError } = await supabase
    .from("bookmark_tags")
    .select("*")
    .eq("label", label)
    .single();
  if (fetchError && fetchError.code !== "PGRST116") {
    // Ignore "no rows found" error
    throw new Error(`Supabase error: ${fetchError.message}`);
  }
  let tag: BookmarkTagRow[] = [];
  if (existingTag) {
    // Tag already exists, use the existing tag_id and increment count
    tag = await increment_bookmark_tag_count(existingTag);
  } else {
    // Tag doesn't exist, create a new one
    const { data: data, error: createError } = await supabase
      .from("bookmark_tags")
      .insert({ label, count: 1 })
      .select();
    if (createError) {
      throw new Error(`Supabase error: ${createError.message}`);
    }

    tag = data as BookmarkTagRow[];
  }

  const tag_id = tag[0]?.id;
  const { error: insertError } = await supabase
    .from("bookmark_to_tags")
    .insert({ bookmark_id, bookmark_tag_id: tag_id });
  if (insertError) {
    throw new Error(`Supabase error: ${insertError.message}`);
  }

  return tag as BookmarkTagRow[];
};

const increment_bookmark_tag_count = async (existing_tag: BookmarkTagRow) => {
  const { data, error } = await supabase
    .from("bookmark_tags")
    .update({ count: existing_tag.count + 1 })
    .eq("id", existing_tag.id)
    .select();
  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
  return data as BookmarkTagRow[];
};

const decrement_bookmark_tag_count = async (existing_tag: BookmarkTagRow, bookmark_id: string) => {
  const newCount = Math.max(0, existing_tag.count - 1);

  if (newCount === 0) {
    return await delete_bookmark_tag(existing_tag.id);
  }
  const { data, error } = await supabase
    .from("bookmark_tags")
    .update({ count: newCount })
    .eq("id", existing_tag.id)
    .select();
  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
  //remove all associations with this tag from bookmark_to_tags
  const { error: deleteError } = await supabase
    .from("bookmark_to_tags")
    .delete()
    .eq("bookmark_tag_id", existing_tag.id)
    .eq("bookmark_id", bookmark_id);
  if (deleteError) {
    throw new Error(`Supabase error: ${deleteError.message}`);
  }
  return data as BookmarkTagRow[];
};

const delete_bookmark_tag = async (tag_id: string) => {
  const { data, error } = await supabase
    .from("bookmark_tags")
    .delete()
    .eq("id", tag_id)
    .select();
  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
  return data as BookmarkTagRow[];
};

//RLS is on, so this will only fetch tags for the current user
const fetch_all_user_tags = async (filter?: string[]) => {
  const user_id = await fetch_user_id();
  if (!user_id) {
    throw new Error("User ID not found.");
  }
  let query = supabase
    .from("bookmark_to_tags")
    .select(`bookmark_tags(*), bookmarks(id)`)
    .eq("bookmarks.user_id", user_id);

  if (filter && filter.length > 0) {
    const sqlList = `(${filter.map((v) => `"${v}"`).join(",")})`;
    query = query.not("bookmark_tags.label", "in", sqlList);
  }

  const { data, error, status } = await query;
  if (error) {
    throw new Error(`Supabase error (${status}): ${error.message}`);
  }
  
  const tags = data?.flatMap((item) => item.bookmark_tags).filter(tag => tag !== null) as BookmarkTagRow[] || [];
  
  // Remove duplicates based on tag id
  const uniqueTags = tags.filter((tag, index, self) => 
    index === self.findIndex(t => t.id === tag.id)
  );
  
  return uniqueTags;
};

export {
  decrement_bookmark_tag_count,
  delete_bookmark_tag,
  fetch_all_user_tags,
  fetch_bookmark_tags,
  increment_bookmark_tag_count,
  insert_bookmark_tag,
};
