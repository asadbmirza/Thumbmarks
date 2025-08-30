import { BookmarkRow } from "@/types/bookmark";
import { Result } from "./utils";

enum BackgroundMessageType {
  CaptureScreen = "CAPTURE_SCREEN",
  DeleteBookmark = "DELETE_BOOKMARK",
  UpdateBookmark = "UPDATE_BOOKMARK",
  GetBookmarks = "GET_BOOKMARKS",
  NavigateToBookmark = "NAVIGATE_TO_BOOKMARK",
}

type BackgroundMessageTypeFunction = {
  [BackgroundMessageType.CaptureScreen]: () => Promise<BookmarkRow[] | void>;
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
  [BackgroundMessageType.NavigateToBookmark]: (payload: {
    url: string;
    scrollX: number;
    scrollY: number;
  }) => void;
};

enum ContentMessageType {
  ShowNotification = "SHOW_NOTIFICATION",
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
  [ContentMessageType.ShowNotification]: (payload: ShowNotification) => void;
  [ContentMessageType.GetScrollData]: () => ScrollData;
};

type Message = {
  type: BackgroundMessageType | ContentMessageType;
  payload?: any;
};

export {
  BackgroundMessageType,
  BackgroundMessageTypeFunction,
  ContentMessageType,
  ContentMessageTypeFunction,
  Message,
  ShowNotification,
  ScrollData,
};
