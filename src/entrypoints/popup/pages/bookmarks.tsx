import { sort_bookmarks, SortedStates } from "@/entrypoints/shared/utils";
import { BookmarkRow } from "@/types/bookmark.types";
import { BookmarkTagRow } from "@/types/bookmark_tags.types";
import { Delete, Edit, FilterList, Sort } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import BookmarkCard from "../components/bookmark_card";
import SearchBar from "../components/search_bar";
import { fetch_all_user_tags } from "../requests/bookmark_tags";

const BookmarksPage = ({
  bookmarks,
  setBookmarks,
  loading,
  error,
  setError,
  handleCapture,
  handleUpdateBookmark,
  handleDeleteBookmark,
  bookmarksWithTags,
}: {
  bookmarks: BookmarkRow[];
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkRow[]>>;
  loading: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  handleCapture: () => void;
  handleUpdateBookmark: (bookmark: BookmarkRow) => void;
  handleDeleteBookmark: (id: string, thumbnail?: string) => void;
  bookmarksWithTags: { [key: string]: BookmarkTagRow[] };
}) => {
  const [sortedState, setSortedState] = useState<SortedStates>(
    SortedStates.Newest
  );
  const [anchorElSort, setAnchorElSort] = useState<null | HTMLElement>(null);
  const [anchorElFilter, setAnchorElFilter] = useState<null | HTMLElement>(
    null
  );
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkRow[]>([]);
  const [currentSearch, setCurrentSearch] = useState<string>("");
  const [allExistingBookmarkTags, setAllExistingBookmarkTags] = useState<
    BookmarkTagRow[]
  >([]);
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [filterIsActive, setFilterIsActive] = useState<boolean>(false);

  const sort_is_open = Boolean(anchorElSort);
  const filter_is_open = Boolean(anchorElFilter);

  const searchFilteredBookmarks = useMemo(() => {
    if (!currentSearch) return bookmarks;

    const lowerCaseQuery = currentSearch.toLowerCase();
    return bookmarks.filter((bookmark) =>
      bookmark.title.toLowerCase().includes(lowerCaseQuery)
    );
  }, [bookmarks, currentSearch]);

  const tagFilteredBookmarks = useMemo(() => {
    const activeTags = selectedFilterTags.filter((tag) => tag !== "");
    if (activeTags.length === 0) {
      setFilterIsActive(false);
      return searchFilteredBookmarks;
    }

    setFilterIsActive(true);
    return searchFilteredBookmarks.filter((bookmark) => {
      const tags = bookmarksWithTags[bookmark.id] || [];
      const tagLabels = tags.map((tag) => tag.label);
      return activeTags.every((tag) => tagLabels.includes(tag));
    });
  }, [searchFilteredBookmarks, selectedFilterTags, bookmarksWithTags]);

  const sortedBookmarks = useMemo(() => {
    return sort_bookmarks(tagFilteredBookmarks, sortedState);
  }, [tagFilteredBookmarks, sortedState]);

  const handleSearch = (query: string) => {
    setCurrentSearch(query);
  };

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

  useEffect(() => {
    loadTags();
  }, [bookmarksWithTags, bookmarks]);

  const loadTags = async () => {
    const tags = await fetch_all_user_tags([]);

    setAllExistingBookmarkTags(tags);
  };

  useEffect(() => {
    setSelectedFilterTags(allExistingBookmarkTags.map(() => ""));
  }, [allExistingBookmarkTags]);

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
        <Typography variant="h6">Your Thumbmarks</Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <SearchBar onSearch={handleSearch} />
          <IconButton
            onClick={(e) => setAnchorElSort(e.currentTarget)}
            title={`Sort by: ${sortedState}`}
          >
            <Sort />
          </IconButton>

          <Menu
            anchorEl={anchorElSort}
            open={sort_is_open}
            onClose={() => setAnchorElSort(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {Object.values(SortedStates).map((state) => (
              <MenuItem
                key={state}
                value={state}
                onClick={() => {
                  setSortedState(state);
                  setAnchorElSort(null);
                }}
              >
                {state}
              </MenuItem>
            ))}
          </Menu>
          <IconButton
            onClick={(e) => setAnchorElFilter(e.currentTarget)}
            title="Filter bookmarks"
          >
            <FilterList
              sx={{
                backgroundColor: filterIsActive
                  ? "primary.main"
                  : "transparent",
                color: filterIsActive ? "primary.contrastText" : "default",
              }}
            />
          </IconButton>
          <Menu
            anchorEl={anchorElFilter}
            open={filter_is_open}
            onClose={() => setAnchorElFilter(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Box p={1} px={2} display={"flex"} flexDirection={"column"} gap={1}>
              <Typography variant="h6">Filter by Tags</Typography>
              <Box
                display={"flex"}
                gap={1}
                maxWidth={500}
                flexWrap={"wrap"}
                sx={{ maxHeight: 400, overflowY: "auto" }}
              >
                {allExistingBookmarkTags.length === 0 ? (
                  <Typography sx={{ m: 1 }}>No tags available</Typography>
                ) : (
                  allExistingBookmarkTags.map((tag, index) => (
                    <>
                      <Chip
                        key={tag.id}
                        label={tag.label}
                        sx={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedFilterTags[index] === ""
                              ? "grey.300"
                              : "primary.main",
                          color:
                            selectedFilterTags[index] === ""
                              ? "text.primary"
                              : "primary.contrastText",
                          "&:hover": {
                            backgroundColor:
                              selectedFilterTags[index] === ""
                                ? "grey.400"
                                : "primary.dark",
                          },
                        }}
                        onClick={() => {
                          const newSelectedTags = [...selectedFilterTags];
                          if (newSelectedTags[index] === tag.label) {
                            newSelectedTags[index] = "";
                          } else {
                            newSelectedTags[index] = tag.label;
                          }
                          setSelectedFilterTags(newSelectedTags);
                        }}
                      />
                    </>
                  ))
                )}
              </Box>
              <Box display={"flex"} justifyContent={"flex-end"} gap={1}>
                <Button
                  sx={{
                    border: "2px solid",
                    borderColor: "error.main",
                    color: "error.main",
                    "&:hover": {
                      backgroundColor: "error.main",
                      color: "primary.contrastText",
                    },
                  }}
                  onClick={() => {
                    setSelectedFilterTags(
                      allExistingBookmarkTags.map(() => "")
                    );
                    setAnchorElFilter(null);
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  sx={{
                    border: "2px solid",
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": {
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                    },
                  }}
                  onClick={() => {
                    const selectedTags = selectedFilterTags.filter(
                      (tag) => tag !== ""
                    );
                    setAnchorElFilter(null);
                  }}
                >
                  Confirm
                </Button>
              </Box>
            </Box>
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

        <Grid container spacing={2}>
          {sortedBookmarks.map((bookmark) => (
            <Grid size={{ xs: 12, sm: 6 }} key={bookmark.id}>
              <BookmarkCard
                bookmark={bookmark}
                setError={setError}
                attachedTags={bookmarksWithTags[bookmark.id] || []}
                menu={[
                  {
                    label: "Edit",
                    action: () => handleUpdateBookmark(bookmark),
                    icon: <Edit />,
                  },
                  {
                    label: "Delete",
                    action: () =>
                      handleDeleteBookmark(
                        bookmark.id,
                        bookmark.thumbnail || undefined
                      ),
                    icon: <Delete />,
                  },
                ]}
              />
            </Grid>
          ))}
        </Grid>
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
