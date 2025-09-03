import { BackgroundMessageType } from "@/entrypoints/shared/message_types";
import { BookmarkInsert, BookmarkRow } from "@/types/bookmark";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import BookmarkCard from "../components/bookmarkCard";
import { Page } from "../types";

const BookmarksPage = ({
  bookmarks,
  setBookmarks,
  loading,
  error,
  setError,
  upsertPage,
}: {
  bookmarks: BookmarkRow[];
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkRow[]>>;
  loading: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  upsertPage: (bookmark: BookmarkInsert, captured: string) => void;
}) => {
  const handleUpdateBookmark = async (
    updatedBookmark: BookmarkRow,
    oldThumbnail?: string
  ) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: BackgroundMessageType.UpdateBookmark,
        payload: { bookmark: updatedBookmark, oldThumbnail },
      });

      if (response.status === "done") {
        setBookmarks((prev) =>
          prev.map((b) => (b.id === updatedBookmark.id ? updatedBookmark : b))
        );
      } else {
        setError(
          response.error instanceof Error
            ? response.error.message
            : "Failed to update bookmark"
        );
        console.error("Error updating bookmark:", response.error);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update bookmark"
      );
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteBookmark = async (id: string, thumbnail?: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: BackgroundMessageType.DeleteBookmark,
        payload: { id, thumbnail },
      });

      if (response.status === "done") {
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
      } else {
        setError(
          response.error instanceof Error
            ? response.error.message
            : "Failed to delete bookmark"
        );
        console.error("Error deleting bookmark:", response.error);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete bookmark"
      );
      console.error("Error sending message:", error);
    }
  };

  const onCapture = async () => {
    try {
      const responseCaptured = await chrome.runtime.sendMessage({
        type: BackgroundMessageType.CaptureScreen,
      });

      if (responseCaptured.status === "error") {
        throw new Error(
          responseCaptured.error?.message || "Failed to capture screen"
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

      upsertPage(responseTabData.data, responseCaptured.data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to capture screen"
      );
      console.error("Error sending message:", error);
    }
  };

  return (
    <Box display="flex" flexDirection="column" height={"100%"}>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: 2,
          minHeight: 0,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Your Thumbmarks
        </Typography>

        {loading && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
            flexDirection="column"
            sx={{ py: 4 }}
          >
            <CircularProgress size={64} />
            <Typography>Loading Thumbmarks...</Typography>
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            Error: {error}
          </Typography>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {bookmarks
            .slice()
            .reverse()
            .map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                setError={setError}
              />
            ))}
        </Box>
      </Box>
      <Box
        sx={{
          py: 1,
          backgroundColor: "background.paper",
          display: "flex",
        }}
      >
        <Button
          onClick={onCapture}
          variant="contained"
          color="secondary"
          sx={{ width: "100%" }}
        >
          + Capture Thumbmark
        </Button>
      </Box>
    </Box>
  );
};

export default BookmarksPage;
