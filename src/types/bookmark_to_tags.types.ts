import { Database } from "./database.types";

export type BookmarkToTagInsert = Database["public"]["Tables"]["bookmark_to_tags"]["Insert"];
export type BookmarkToTagRow = Database["public"]["Tables"]["bookmark_to_tags"]["Row"];
export type BookmarkToTagUpdate = Database["public"]["Tables"]["bookmark_to_tags"]["Update"];