import { Database } from "./database.types";

export type BookmarkTagInsert = Database["public"]["Tables"]["bookmark_tags"]["Insert"];
export type BookmarkTagRow = Database["public"]["Tables"]["bookmark_tags"]["Row"];
export type BookmarkTagUpdate = Database["public"]["Tables"]["bookmark_tags"]["Update"];