import { Result } from "./utils";

enum BackgroundMessageType {
  CaptureScreen = "CAPTURE_SCREEN",
  DeleteBookmark = "DELETE_BOOKMARK"
}


type BackgroundMessageTypeFunction = {
  [key in BackgroundMessageType]: () => void;
};

enum ContentMessageType {
  ShowNotification = "SHOW_NOTIFICATION",
  GetScrollData = "GET_SCROLL_DATA"
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
  ScrollData
};
