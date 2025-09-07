import placeholderimg from "@/assets/placeholder.png";
import { BackgroundMessageType } from "@/entrypoints/shared/message_types";
import { get_thumbnail_url } from "@/lib/supabase/operations/bookmark";
import { BookmarkInsert, BookmarkRow } from "@/types/bookmark.types";
import { BookmarkTagRow } from "@/types/bookmark_tags.types";
import {
  Box,
  Button,
  Chip,
  FormGroup,
  FormHelperText,
  FormLabel,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { Page } from "../types";
import TagModal from "./bookmark_tags_modal";
import { fetch_all_user_tags } from "../requests/bookmark_tags";

const UpsertBookmarkPage = ({
  bookmark,
  captured,
  setBookmarkSetup,
  setCapturedImage,
  setPage,
  bookmarks,
  setBookmarks,
  setNotification,
  attachedTags,
  insertTag,
  decrementTag,
}: {
  bookmark: BookmarkInsert | BookmarkRow;
  captured: string | null;
  setBookmarkSetup: (bookmark: BookmarkInsert | BookmarkRow | null) => void;
  setCapturedImage: (image: string | null) => void;
  setPage: (page: Page) => void;
  bookmarks: BookmarkRow[];
  setBookmarks: (bookmarks: BookmarkRow[]) => void;
  setNotification: (message: string | null) => void;
  attachedTags: BookmarkTagRow[];
  insertTag: (bookmark_id: string, label: string) => Promise<void>;
  decrementTag: (
    bookmark_id: string,
    existing_row: BookmarkTagRow
  ) => Promise<void>;
}) => {
  const [tagsToAdd, setTagsToAdd] = React.useState<string[]>([]);
  const [tagsToDecrement, setTagsToDecrement] = React.useState<
    BookmarkTagRow[]
  >([]);
  const [tagModalOpen, setTagModalOpen] = React.useState<boolean>(false);
  const [allExistingTags, setAllExistingTags] = React.useState<string[]>([]);

  const visibleAttachedTags = useMemo(
    () =>
      attachedTags.filter(
        (tag) =>
          !tagsToDecrement.some(
            (decrementTag) => decrementTag.label === tag.label
          )
      ),
    [attachedTags, tagsToDecrement]
  );

  const loadTags = async () => {
    const tags = await fetch_all_user_tags([
      ...tagsToAdd,
      ...visibleAttachedTags.map((t) => t.label),
    ]);
    setAllExistingTags(tags.map((tag: BookmarkTagRow) => tag.label));
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleImageChange = async () => {
    const image = await chrome.runtime.sendMessage({
      type: BackgroundMessageType.CaptureScreen,
    });
    if (image.status == "done" && image.data) {
      setCapturedImage(image.data);
    }
    const tabData = await chrome.runtime.sendMessage({
      type: BackgroundMessageType.GetTabData,
    });
    if (tabData.status == "done" && tabData.data) {
      setBookmarkSetup({
        ...bookmark,
        scroll_x: tabData.data.scroll_x,
        scroll_y: tabData.data.scroll_y,
        url: tabData.data.url,
        title: tabData.data.title,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookmarkSetup({
      ...bookmark,
      [name]: value,
    });
  };

  const handleSave = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const result = await chrome.runtime.sendMessage({
      type: BackgroundMessageType.ProcessBookmark,
      payload: { bookmark, captured },
    });
    if (result.status == "done") {
      const updatedBookmark: BookmarkRow = result.data[0];
      const exists = bookmarks.some(
        (b: BookmarkRow) => b.id === updatedBookmark.id
      );

      if (exists) {
        setBookmarks(
          bookmarks.map((b: BookmarkRow) =>
            b.id === updatedBookmark.id ? updatedBookmark : b
          )
        );
      } else {
        setBookmarks([...bookmarks, updatedBookmark]);
      }

      for (const tag of tagsToAdd) {
        await insertTag(updatedBookmark.id, tag);
      }
      setTagsToAdd([]);
      for (const tagRow of tagsToDecrement) {
        await decrementTag(updatedBookmark.id, tagRow);
      }
      setTagsToDecrement([]);
      loadTags();
    }

    setBookmarkSetup(null);
    setCapturedImage(null);
    setPage("bookmarks");
    setNotification("Bookmarks updated!");
  };

  const handleDiscard = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setBookmarkSetup(null);
    setCapturedImage(null);
    setPage("bookmarks");
  };

  return (
    <>
      <TagModal
        open={tagModalOpen}
        onClose={() => setTagModalOpen(false)}
        onAdd={(tag: string) => {
          setTagsToAdd([...tagsToAdd, tag]);
        }}
        validateTag={(tag: string) => {
          const lowerTag = tag.toLowerCase();
          const alreadyAdded = tagsToAdd
            .map((t) => t.toLowerCase())
            .includes(lowerTag);
          const alreadyVisible = visibleAttachedTags
            .map((t) => t.label.toLowerCase())
            .includes(lowerTag);
          return !alreadyAdded && !alreadyVisible;
        }}
        potentialTags={allExistingTags}
        setNotification={setNotification}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            minHeight: 0,
            overflowY: "auto",
          }}
        >
          <Typography variant="h6">Edit Thumbmark</Typography>
          <TextField
            label="Title"
            name="title"
            value={bookmark.title}
            onChange={handleChange}
            placeholder="Enter a title for the bookmark"
            fullWidth
            required
          />
          <FormGroup>
            <Box
              sx={{
                position: "relative",
                "&:hover .overlay": { opacity: 1 },
                cursor: "pointer",
              }}
            >
              <Box
                component={"img"}
                src={
                  captured ||
                  get_thumbnail_url(bookmark?.thumbnail) ||
                  placeholderimg
                }
                alt="Thumbnail"
                sx={{
                  objectFit: "cover",
                  objectPosition: "top",
                  height: "240px",
                  width: "100%",
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = placeholderimg;
                }}
              />
              <Box
                className="overlay"
                onClick={handleImageChange}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "rgba(0, 0, 0, 0.5)",
                  opacity: 0,
                  transition: "opacity 0.3s",
                }}
              >
                <Typography
                  variant="body2"
                  color="white"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    p: 1,
                  }}
                >
                  Take New Picture
                </Typography>
              </Box>
            </Box>
          </FormGroup>
          <FormGroup>
            <TextField
              label="URL"
              name="url"
              value={bookmark.url}
              disabled
              fullWidth
              required
            />
            <FormHelperText sx={{ textAlign: "center" }}>
              Url of the page can only be changed by capturing a new screenshot
            </FormHelperText>
          </FormGroup>
          <TextField
            label="Notes"
            name="notes"
            value={bookmark?.notes}
            onChange={handleChange}
            fullWidth
            multiline
            placeholder="Fill in optional notes if you want to remember something about this bookmark."
            rows={4}
          />
          <FormGroup>
            <Box display="flex" gap={2}>
              <TextField
                label="X Position"
                name="scroll_x"
                value={bookmark.scroll_x}
                disabled
                placeholder="0"
              />
              <TextField
                label="Y Position"
                name="scroll_y"
                value={bookmark.scroll_y}
                disabled
                placeholder="0"
              />
            </Box>
            <FormHelperText sx={{ textAlign: "center" }}>
              Position of the page when captured in pixels, note that some pages
              may not allow scrolling due to scripting limitations.
            </FormHelperText>
          </FormGroup>
          <FormGroup sx={{ gap: 2 }}>
            <FormLabel>Tags</FormLabel>
            <Box>
              {visibleAttachedTags.map((tag) => (
                <Chip
                  key={tag.label}
                  label={`${tag.label}`}
                  color="primary"
                  onDelete={() => {
                    setTagsToDecrement([...tagsToDecrement, tag]);
                    loadTags();
                  }}
                />
              ))}
              {tagsToAdd.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  color="secondary"
                  onDelete={() => {
                    setTagsToAdd(tagsToAdd.filter((t) => t !== tag));
                    loadTags();
                  }}
                />
              ))}
            </Box>
            <Button
              variant="outlined"
              onClick={() => setTagModalOpen(true)}
              sx={{ width: "fit-content", alignSelf: "center" }}
            >
              Add Tag
            </Button>
          </FormGroup>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            bgcolor: "background.paper",
            py: 1,
          }}
        >
          <Button
            sx={{
              border: "2px solid",
              borderColor: "error.main",
              color: "error.main",
              "&:hover": {
                backgroundColor: "error.main",
                color: "error.contrastText",
              },
            }}
            onClick={handleDiscard}
          >
            Discard
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
            type="submit"
            onClick={handleSave}
          >
            Save
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default UpsertBookmarkPage;
