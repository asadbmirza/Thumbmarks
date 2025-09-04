import { BackgroundMessageType } from "@/entrypoints/shared/message_types";
import { sort_bookmarks, SortedStates } from "@/entrypoints/shared/utils";
import { BookmarkRow } from "@/types/bookmark";
import { Sort } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import BookmarkCard from "../components/bookmark_card";
import SearchBar from "../components/search_bar";

const BookmarksPage = ({
  bookmarks,
  setBookmarks,
  loading,
  error,
  setError,
  handleCapture,
}: {
  bookmarks: BookmarkRow[];
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkRow[]>>;
  loading: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  handleCapture: () => void;
}) => {
  const [sortedState, setSortedState] = useState<SortedStates>(
    SortedStates.Newest
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkRow[]>([]);
  const [currentSearch, setCurrentSearch] = useState<string>("");
  const open = Boolean(anchorEl);

  const handleSearch = (query: string) => {
    setCurrentSearch(query);
    const lowerCaseQuery = query.toLowerCase();
    setFilteredBookmarks(() =>
      bookmarks.filter((bookmark) =>
        bookmark.title.toLowerCase().includes(lowerCaseQuery)
      )
    );
  };


  useEffect(() => {
    setFilteredBookmarks(() => [...bookmarks]);
    if (currentSearch) {
        handleSearch(currentSearch);
    }
  }, [bookmarks]);

  useEffect(() => {
    chrome.storage.local.get("sortedState", (result) => {
      if (result.sortedState) {
        setSortedState(result.sortedState);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ sortedState });
  }, [sortedState]);

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setAnchorEl(null);
  };

  const sortedBookmarks = useMemo(() => {
    return sort_bookmarks(filteredBookmarks, sortedState);
  }, [filteredBookmarks, sortedState]);

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

  return (
    <Box display="flex" flexDirection="column" height={"100%"}>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: 2,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6">
          Your Thumbmarks
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <SearchBar onSearch={handleSearch} />
          <IconButton
            onClick={handleSortClick}
            title={`Sort by: ${sortedState}`}
          >
            <Sort />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleSortClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {Object.values(SortedStates).map((state) => (
              <MenuItem
                key={state}
                value={state}
                onClick={() => {
                  setSortedState(state);
                  handleSortClose();
                }}
              >
                {state}
              </MenuItem>
            ))}
          </Menu>
        </Box>

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
          {sortedBookmarks.map((bookmark) => (
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
          onClick={handleCapture}
          variant="contained"
          color="secondary"
          sx={{ width: "100%" }}
        >
          + Capture Current Tab
        </Button>
      </Box>
    </Box>
  );
};

export default BookmarksPage;
