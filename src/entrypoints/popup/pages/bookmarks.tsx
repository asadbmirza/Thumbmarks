import { BackgroundMessageType } from "@/entrypoints/shared/message_types";
import { BookmarkRow } from "@/types/bookmark";
import { Box } from "@mui/material";
import { useEffect } from "react";
import BookmarkCard from "../components/bookmarkCard";
import { Page } from "../types";

const BookmarksPage = ({
  bookmarks,
  setBookmarks,
  loading,
  error,
  setError,
  setPage
}: {
  bookmarks: BookmarkRow[];
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkRow[]>>;
  loading: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setPage: (page: Page) => void;
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
      const response = await chrome.runtime.sendMessage({
        type: BackgroundMessageType.CaptureScreen,
      });

      if (response.status === "done") {
        setBookmarks((prev) => [response.data, ...prev]);
      } else {
        setError(
          response.error instanceof Error
            ? response.error.message
            : "Failed to capture screen"
        );
        console.error("Error capturing screen:", response.error);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to capture screen"
      );
      console.error("Error sending message:", error);
    }
  };

  console.log("Current bookmarks:", bookmarks);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <h2>Bookmarks</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </Box>
  );
};

export default BookmarksPage;
