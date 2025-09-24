import { BookmarkInsert, BookmarkRow } from "@/types/bookmark.types";
import { Result } from "./utils";
import { BookmarkTagRow } from "@/types/bookmark_tags.types";

enum BackgroundMessageType {
  CaptureScreen = "CAPTURE_SCREEN",
  DeleteBookmark = "DELETE_BOOKMARK",
  UpdateBookmark = "UPDATE_BOOKMARK",
  GetBookmarks = "GET_BOOKMARKS",
  ProcessBookmark = "PROCESS_BOOKMARK",
  NavigateToBookmark = "NAVIGATE_TO_BOOKMARK",
  GetTabData = "GET_TAB_DATA",
  GetBookmarkTags = "GET_BOOKMARK_TAGS",
  InsertBookmarkTag = "INSERT_BOOKMARK_TAG",
  DecrementBookmarkTag = "DECREMENT_BOOKMARK_TAG",
  FetchAllUserTags = "FETCH_ALL_USER_TAGS",
}

type BackgroundMessageTypeFunction = {
  [BackgroundMessageType.CaptureScreen]: () => Promise<string | void>;
  [BackgroundMessageType.DeleteBookmark]: (payload: {
    id: string;
    thumbnail?: string;
  }) => Promise<BookmarkRow[] | undefined>;
  [BackgroundMessageType.UpdateBookmark]: (payload: {
    bookmark: BookmarkRow;
    oldThumbnail?: string;
  }) => Promise<BookmarkRow[] | undefined>;
  [BackgroundMessageType.GetBookmarks]: () => Promise<
    BookmarkRow[] | undefined
  >;
  [BackgroundMessageType.ProcessBookmark]: (payload: {
    bookmark: BookmarkRow;
    captured?: string;
  }) => Promise<BookmarkRow[] | undefined>;
  [BackgroundMessageType.NavigateToBookmark]: (payload: {
    url: string;
    scrollX: number;
    scrollY: number;
  }) => void;
  [BackgroundMessageType.GetTabData]: () => Promise<BookmarkInsert | undefined>;
  [BackgroundMessageType.GetBookmarkTags]: (payload: { bookmark_id: string }) => Promise<BookmarkTagRow[]>;
  [BackgroundMessageType.InsertBookmarkTag]: (payload: {
    bookmark_id: string;
    label: string;
  }) => Promise<BookmarkTagRow[]>;
  [BackgroundMessageType.DecrementBookmarkTag]: (payload: {
    existing_row: BookmarkTagRow;
    bookmark_id: string;
  }) => Promise<BookmarkTagRow[] | undefined>;
  [BackgroundMessageType.FetchAllUserTags]: (payload?: { filter: string[] }) => Promise<BookmarkTagRow[]>;
};

enum ContentMessageType {
  GetScrollData = "GET_SCROLL_DATA",
}

type ShowNotification = {
  message: string;
  result: Result;
  duration: number;
};

type ScrollData = {
  scrollX: number;
  scrollY: number;
  documentHeight: number;
  windowHeight: number;
};

type ContentMessageTypeFunction = {
  [ContentMessageType.GetScrollData]: () => ScrollData;
};

type Message = {
  type: BackgroundMessageType | ContentMessageType | string;
  payload?: any;
};

export {
  BackgroundMessageType,
  BackgroundMessageTypeFunction,
  ContentMessageType,
  ContentMessageTypeFunction,
  Message,
  ScrollData,
  ShowNotification,
};
