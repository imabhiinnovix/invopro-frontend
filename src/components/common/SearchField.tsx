import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchField({
  searchValue,
  handleSearchChange,
}: {
  searchValue: string;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <TextField
      placeholder="Search ..."
      variant="outlined"
      size="small"
      value={searchValue}
      autoComplete="off"
      onChange={handleSearchChange}
      sx={{
        width: "300px",
        "& .MuiOutlinedInput-root": { borderRadius: "8px" },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
}
