import { Box } from "@mui/material";
import BookmarkCard from "../components/bookmarkCard";
import { BookmarkRow } from "@/types/bookmark";
import { BackgroundMessageType, Message } from "@/entrypoints/shared/message_types";
import { useState, useEffect } from 'react';

const BookmarksPage = () => {
    const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await chrome.runtime.sendMessage({
                type: BackgroundMessageType.GetBookmarks,
            });
            console.log("Response received:", response);
            if (response.status === "done") {
                setBookmarks(response.data);
            } else {
                setError(response.error instanceof Error ? response.error.message : 'Failed to update bookmark');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch bookmarks');
        } finally {
            setLoading(false);
        }
    };


    const handleUpdateBookmark = async (updatedBookmark: BookmarkRow, oldThumbnail?: string) => {
        try {
            const response = await chrome.runtime.sendMessage({
                type: BackgroundMessageType.UpdateBookmark,
                payload: { bookmark: updatedBookmark, oldThumbnail }
            });

            if (response.status === "done") {
                setBookmarks(prev => prev.map(b => b.id === updatedBookmark.id ? updatedBookmark : b));
            } else {
                setError(response.error instanceof Error ? response.error.message : 'Failed to update bookmark');
                console.error("Error updating bookmark:", response.error);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update bookmark');
            console.error("Error sending message:", error);
        }
    };

    const handleDeleteBookmark = async (id: string, thumbnail?: string) => {
        try {
            const response = await chrome.runtime.sendMessage({
                type: BackgroundMessageType.DeleteBookmark,
                payload: { id, thumbnail }
            });

            if (response.status === "done") {
                setBookmarks(prev => prev.filter(b => b.id !== id));
            } else {
                setError(response.error instanceof Error ? response.error.message : 'Failed to delete bookmark');
                console.error("Error deleting bookmark:", response.error);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete bookmark');
            console.error("Error sending message:", error);
        }
    };

    const onCapture = async () => {
        try {
            const response = await chrome.runtime.sendMessage({
                type: BackgroundMessageType.CaptureScreen,
            });

            if (response.status === "done") {
                setBookmarks(prev => [response.data, ...prev]);
            } else {
                setError(response.error instanceof Error ? response.error.message : 'Failed to capture screen');
                console.error("Error capturing screen:", response.error);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to capture screen');
            console.error("Error sending message:", error);
        }
    };

    useEffect(() => {
        fetchData();

        const handleMessage = (message: Message) => {
            if (message.type === BackgroundMessageType.CaptureScreen && message.payload) {
                console.log("New bookmark received via message:", message.payload);
                setBookmarks(prev => [...message.payload, ...prev]);
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        
        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    console.log("Current bookmarks:", bookmarks);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <h2>Bookmarks</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {bookmarks.map(bookmark => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </Box>
  );
};

export default BookmarksPage;