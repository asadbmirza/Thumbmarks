import { Database } from "./database.types"

export type BookmarkInsert = Database["public"]["Tables"]["bookmarks"]["Insert"]
export type BookmarkRow = Database["public"]["Tables"]["bookmarks"]["Row"]
export type BookmarkUpdate = Database["public"]["Tables"]["bookmarks"]["Update"]