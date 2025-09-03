import { BookmarkInsert, BookmarkRow } from "@/types/bookmark";
import { Box, Typography } from "@mui/material";
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

  if (error) {
    setTimeout(() => setError(null), 5000);
  }

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

  const handlePendingBookmark = async () => {
    const { pendingBookmark } = await chrome.storage.local.get(
      "pendingBookmark"
    );
    console.log("Pending bookmark found:", pendingBookmark);
    if (pendingBookmark) {
      const { tabData, captured } = pendingBookmark;
      if (tabData && captured) {
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
            upsertPage={(bookmark: BookmarkInsert, captured: string) => {
              setBookmarkSetup(bookmark);
              setCapturedImage(captured);
              setPage("upsert");
            }}
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
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
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
