import placeholderimg from "@/assets/placeholder.png";
import { BackgroundMessageType } from "@/entrypoints/shared/message_types";
import { get_thumbnail_url } from "@/lib/supabase/operations/bookmark";
import { BookmarkInsert, BookmarkRow } from "@/types/bookmark";
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

const UpsertBookmarkPage = ({
  bookmark,
  captured,
  setBookmarkSetup,
  setCapturedImage,
  setPage,
  bookmarks,
  setBookmarks,
}: {
  bookmark: BookmarkInsert | BookmarkRow;
  captured: string | null;
  setBookmarkSetup: (bookmark: BookmarkInsert | BookmarkRow | null) => void;
  setCapturedImage: (image: string | null) => void;
  setPage: (page: Page) => void;
  bookmarks: BookmarkRow[];
  setBookmarks: (bookmarks: BookmarkRow[]) => void;
}) => {
  const handleImageChange = async () => {
    const image = await chrome.runtime.sendMessage({
      type: BackgroundMessageType.CaptureScreen,
    });
    if (image.status == "done" && image.data) {
      setCapturedImage(image.data);
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
    console.log("upsert bookmark response:", result);
    if (result.status == "done") {
      setBookmarks([...bookmarks, ...result.data]);
    }
    setPage("bookmarks");
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
        <TextField
          label="URL"
          name="url"
          value={bookmark.url}
          helperText="Url can't be changed once captured"
          disabled
          fullWidth
          required
        />
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
          <FormHelperText sx={{ textAlign: "center"}}>
            Position of the page when captured in pixels, note that some pages
            may not allow scrolling due to scripting limitations.
          </FormHelperText>
        </FormGroup>
        <FormGroup>
          <FormLabel>Tags</FormLabel>
          <Box>
            <Chip
              label="Removable"
              onDelete={() => console.log("Deleted")}
              sx={{
                color: "primary.contrastText",
                backgroundColor: "secondary.light",
              }}
            />
          </Box>
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
  );
};

export default UpsertBookmarkPage;
