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

  const fetchData = async () => {
    try {
      setBookmarksLoading(true);
      setError(null);
      const response = await chrome.runtime.sendMessage({
        type: BackgroundMessageType.GetBookmarks,
      });
      console.log("Response received:", response);
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleMessage = (message: Message) => {
      if (message.type === "SETUP_BOOKMARK" && message.payload) {
        console.log("New bookmark received via message:", message.payload);
        setBookmarkSetup(message.payload.tabData);
        setCapturedImage(message.payload.captured);
        setPage("upsert");
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const renderContent = () => {
    return (
      <>
        <Box sx={{ display: page === "bookmarks" ? "block" : "none" }}>
          <BookmarksPage
            bookmarks={bookmarks}
            setBookmarks={setBookmarks}
            loading={bookmarksLoading}
            error={error}
            setError={setError}
            setPage={setPage}
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
          overflowY: "auto",
          height: 0,
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
}

export default App;
