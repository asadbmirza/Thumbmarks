import { Result } from "./utils";

enum BackgroundMessageType {
  CaptureScreen = "CAPTURE_SCREEN",
}


type BackgroundMessageTypeFunction = {
  [key in BackgroundMessageType]: () => void;
};

enum ContentMessageType {
  ShowNotification = "SHOW_NOTIFICATION",
}

type ShowNotification = {
  message: string;
  result: Result;
  duration: number;
};

type ContentMessageTypeFunction = {
  [ContentMessageType.ShowNotification]: (payload: ShowNotification) => void;
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
  ShowNotification
};
