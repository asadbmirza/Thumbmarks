import placeholderImg from "@/assets/placeholder.png";
import { BackgroundMessageType } from "@/entrypoints/shared/message_types";
import { get_thumbnail_url } from "@/lib/supabase/operations/bookmark";
import { BookmarkRow } from "@/types/bookmark.types";
import { BookmarkTagRow } from "@/types/bookmark_tags.types";
import { MoreVert } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { ANIMATION_DURATION } from "../theme";

const BookmarkCard = ({
  bookmark,
  setError,
  menu,
  attachedTags,
}: {
  bookmark: BookmarkRow;
  setError: (message: string) => void;
  menu: Array<{ label: string; action: () => void; icon?: React.ReactNode }>;
  attachedTags: BookmarkTagRow[];
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event?: any) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const thumbnailUrl = get_thumbnail_url(bookmark.thumbnail);

  const handleNavigation = async () => {
    const response = await chrome.runtime.sendMessage({
      type: BackgroundMessageType.NavigateToBookmark,
      payload: {
        url: bookmark.url,
        scrollX: bookmark.scroll_x,
        scrollY: bookmark.scroll_y,
      },
    });

    if (response.status === "error") {
      console.error("Navigation failed:", response.error);
      const extraMsg =
        " Note: Certain pages do not allow for scripting the scroll position";
      setError(
        response.error.message + extraMsg || "Navigation failed." + extraMsg
      );
    }
  };

  return (
    <Card
      sx={{
        cursor: "pointer",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: "background.paper",
        transition: `box-shadow ${ANIMATION_DURATION}ms`,
        overflow: "hidden",
        "&:hover": {
          boxShadow: 6,
        },
        "&:hover .thumbnail": {
          transform: "scale(1.05)",
        },
      }}
      onClick={handleNavigation}
    >
      <CardHeader
        title={bookmark.title}
        slotProps={{
          title: {
            variant: "h6",
          },
        }}
        action={
          <IconButton
            className="overlay"
            sx={{
              color: "text.primary",
            }}
            onClick={handleClick}
          >
            <MoreVert />
          </IconButton>
        }
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {Object.values(menu).map((item) => (
          <MenuItem
            key={item.label}
            value={item.label}
            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
            onClick={(event) => {
              event.stopPropagation();
              item.action();
              handleClose();
            }}
          >
            {item.icon}
            {item.label}
          </MenuItem>
        ))}
      </Menu>
      <CardMedia
        component="img"
        className="thumbnail"
        image={thumbnailUrl || placeholderImg}
        alt={bookmark.title}
        sx={{
          objectFit: "cover",
          objectPosition: "top",
          maxHeight: 240,
          width: "100%",
          height: "auto",
          transition: `${ANIMATION_DURATION}ms`,
        }}
      />

      <CardContent>
        <Typography variant="body2" color="text.secondary" noWrap>
          {bookmark.url}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {bookmark.notes || (
            <Button
              variant="text"
              onClick={(e) => {
                e.stopPropagation();
                menu[0]?.action();
              }}
            >
              Add Notes
            </Button>
          )}
        </Typography>
        <Box
          display={"flex"}
          flexWrap="wrap"
          mt={1}
          gap={0.5}
          justifyContent="center"
        >
          {attachedTags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.label}
              sx={{
                backgroundColor: "primary.main",
                color: "primary.contrastText",
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookmarkCard;
