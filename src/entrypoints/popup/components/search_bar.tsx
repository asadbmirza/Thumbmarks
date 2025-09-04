import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({ onSearch } : { onSearch: (query: string) => void }) => {
  return (
    <TextField
      placeholder="Search…"
      variant="outlined"
      size="small"
      fullWidth
      onChange={(e) => onSearch(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export default SearchBar;