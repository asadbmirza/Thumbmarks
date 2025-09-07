import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

const TagModal = ({
  open,
  onClose,
  onAdd,
  validateTag,
  potentialTags,
  setNotification,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (tag: string) => void;
  validateTag: (tag: string) => boolean;
  potentialTags: string[];
  setNotification: (msg: string) => void;
}) => {
  const [tagInput, setTagInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const handleAdd = (tag: string) => {
    if (tag.trim() && validateTag(tag.trim())) {
      onAdd(tag.trim());
      setTagInput("");
      setError(null);
      setNotification(`Tag "${tag.trim()}" added`);
    } else {
      setError("Invalid or duplicate tag");
    }
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Tag</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Tag Name"
          type="text"
          fullWidth
          variant="outlined"
          value={tagInput}
          onChange={(e) => {
            setTagInput(e.target.value);
            setError(null);
          }}
          error={!!error}
          helperText={error}
        />
        <Box>
          {potentialTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => {
                handleAdd(tag);
              }}
              style={{ margin: "4px", cursor: "pointer" }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleAdd(tagInput)}>Add</Button>
        <Button
          onClick={() => {
            onClose();
            setError(null);
          }}
        >
          Finish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TagModal;
