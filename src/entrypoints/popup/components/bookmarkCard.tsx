import placeholderImg from "@/assets/placeholder.png";
import { BackgroundMessageType } from "@/entrypoints/shared/message_types";
import { get_thumbnail_url } from "@/lib/supabase/operations/bookmark";
import { BookmarkRow } from "@/types/bookmark";
import { MoreVert } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import { ANIMATION_DURATION } from "../theme";

const BookmarkCard = ({ bookmark }: { bookmark: BookmarkRow }) => {
  const thumbnailUrl = get_thumbnail_url(bookmark.thumbnail);

  const handleNavigation = () => {
    chrome.runtime.sendMessage({
      type: BackgroundMessageType.NavigateToBookmark,
      payload: {
        url: bookmark.url,
        scrollX: bookmark.scroll_x,
        scrollY: bookmark.scroll_y,
      },
    });
  };

  return (
    <Card
      sx={{
        position: "relative",
        "&:hover .overlay": { opacity: 1 },
        cursor: "pointer",
      }}
      onClick={handleNavigation}
    >
      <CardMedia
        component="img"
        height="240"
        image={thumbnailUrl || placeholderImg}
        alt={bookmark.title}
        sx={{ objectFit: "cover", objectPosition: "top" }}
      />
      <IconButton
        className="overlay"
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          opacity: 0,
          transition: `opacity ${ANIMATION_DURATION}ms`,
          color: "common.white",
          backgroundColor: "rgba(0, 0, 0, 0.72)",
          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.77)" },
        }}
      >
        <MoreVert />
      </IconButton>
      <CardContent>
        <Typography variant="h6">{bookmark.title}</Typography>
      </CardContent>
    </Card>
  );
};

export default BookmarkCard;
