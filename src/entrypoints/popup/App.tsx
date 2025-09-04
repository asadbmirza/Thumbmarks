import { BookmarkInsert, BookmarkRow } from "@/types/bookmark";
import { Alert, Box, Snackbar, Typography } from "@mui/material";
import { BackgroundMessageType, Message } from "../shared/message_types";
import "./App.css";
import Header from "./header/header";
import BookmarksPage from "./pages/bookmarks";
import UpsertBookmarkPage from "./pages/upsert_bookmark";
import { Page } from "./types";

function App() {
  const [page, setPage] = useState<Page>("bookmarks");
  const [bookmarkSetup, setBookmarkSetup] = useState<
    BookmarkInsert | BookmarkRow | null
  >(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  if (error) {
    setTimeout(() => setError(null), 5000);
  }

  const requestActiveTab = async () => {
    const [currentTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!currentTab?.id) {
      setError("No active tab found");
      return false;
    }

    // Execute a tiny script to "activate" the permission for background
    await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => {
        // This empty function execution transfers activeTab to background
        return true;
      },
    });

    return true;
  };

  const fetchData = async () => {
    try {
      setBookmarksLoading(true);
      setError(null);
      const response = await chrome.runtime.sendMessage({
        type: BackgroundMessageType.GetBookmarks,
      });
      if (response.status === "done") {
        setBookmarks(response.data);
      } else {
        setError(
          response.error instanceof Error
            ? response.error.message
            : "Failed to update bookmark"
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch bookmarks"
      );
    } finally {
      setBookmarksLoading(false);
    }
  };

  const handleCapture = async () => {
    try {
      const responseCaptured = await chrome.runtime.sendMessage({
        type: BackgroundMessageType.CaptureScreen,
      });

      if (responseCaptured.status === "error") {
        const errMsg =
          "Some pages don't allow captures from the popup menu on the first try. Try capturing the thumbmark from the context menu(right click the page, then save)! ";
        throw new Error(
          errMsg
        );
      }
      const responseTabData = await chrome.runtime.sendMessage({
        type: BackgroundMessageType.GetTabData,
      });
      if (responseTabData.status === "error") {
        throw new Error(
          responseTabData.error?.message || "Failed to get tab data"
        );
      }
      setNotification("Thumbmark captured!");
      setBookmarkSetup(responseTabData.data);
      setCapturedImage(responseCaptured.data);
      setPage("upsert");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to capture screen"
      );
      console.error("Error sending message:", error);
    }
  };

  const handlePendingBookmark = async () => {
    const { pendingBookmark } = await chrome.storage.local.get(
      "pendingBookmark"
    );
    if (pendingBookmark) {
      const { tabData, captured } = pendingBookmark;
      if (tabData && captured) {
        setNotification("Thumbmark captured!");
        setBookmarkSetup(tabData);
        setCapturedImage(captured);
        setPage("upsert");
        chrome.storage.local.remove("pendingBookmark");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleMessage = async (message: Message) => {
      if (message.type === "SETUP_BOOKMARK" && message.payload) {
        setBookmarkSetup(message.payload.tabData);
        setCapturedImage(message.payload.captured);
        setPage("upsert");
      } else if (message.type === "NEW_BOOKMARK" && message.payload) {
        setBookmarks((prev) => [...prev, ...message.payload.bookmark]);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    handlePendingBookmark();

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  useEffect(() => {
    if (error) {
      setNotification(error);
    }
  }, [error]);

  const renderContent = () => {
    return (
      <>
        <Box
          sx={{
            display: page === "bookmarks" ? "block" : "none",
            height: "100%",
          }}
        >
          <BookmarksPage
            bookmarks={bookmarks}
            setBookmarks={setBookmarks}
            loading={bookmarksLoading}
            error={error}
            setError={setError}
            handleCapture={handleCapture}
          />
        </Box>
        <Box
          sx={{ display: page === "upsert" ? "block" : "none", height: "100%" }}
        >
          {bookmarkSetup ? (
            <UpsertBookmarkPage
              bookmark={bookmarkSetup}
              captured={capturedImage}
              setBookmarkSetup={setBookmarkSetup}
              setCapturedImage={setCapturedImage}
              setPage={setPage}
              bookmarks={bookmarks}
              setBookmarks={setBookmarks}
              setNotification={setNotification}
            />
          ) : (
            <Box>
              <Typography>No bookmark selected</Typography>
            </Box>
          )}
        </Box>
        {/* <Box sx={{ display: page === 'settings' ? 'block' : 'none' }}>
          <SettingsPage />
        </Box>
        <Box sx={{ display: page === 'profile' ? 'block' : 'none' }}>
          <ProfilePage />
        </Box> */}
      </>
    );
  };
  console.log("error: ", error, Boolean(error));
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={Boolean(error) ? null : 5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
         onClose={() => {
          setNotification(null);
          setError(null);
        }}
      >
        <Alert
          onClose={() => {
            setNotification(null);
            setError(null);
          }}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {notification}
        </Alert>
      </Snackbar>
      <Header currentPage={page} onNavigate={(page: Page) => setPage(page)} />
      <Box
        sx={{
          flex: 1, // Takes remaining space after header
          paddingX: 2,
          pt: 2,
          minHeight: 0,
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
}

export default App;
