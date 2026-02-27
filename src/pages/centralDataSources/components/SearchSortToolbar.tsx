import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { DateTime } from "luxon";
import { STYLE_GUIDE } from "../../../styles";

interface SearchSortToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  typeOptions: { label: string; value: string }[];
  selectedPeriod: DateTime | null;
  onPeriodChange: (value: DateTime | null) => void;
  isFilterActive?: boolean;
  onReset?: () => void;
}

const selectSx = {
  minWidth: 120,
  height: "40px",
  borderRadius: "8px",
  fontSize: "14px",
  backgroundColor: STYLE_GUIDE.COLORS.white,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: STYLE_GUIDE.COLORS.inputFieldBorder,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: STYLE_GUIDE.COLORS.inputFieldBorder,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: STYLE_GUIDE.COLORS.inputFieldBorder,
    borderWidth: 1,
  },
};

export default function SearchSortToolbar({
  searchValue,
  onSearchChange,
  selectedType,
  onTypeChange,
  typeOptions,
  selectedPeriod,
  onPeriodChange,
  isFilterActive = false,
  onReset,
}: SearchSortToolbarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexWrap: "wrap",
        mb: 2,
      }}
    >
      <TextField
        placeholder="Search files by name or uploader..."
        variant="outlined"
        size="small"
        value={searchValue}
        autoComplete="off"
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          flex: 1,
          minWidth: "200px",
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            height: "40px",
            backgroundColor: STYLE_GUIDE.COLORS.white,
            "& fieldset": {
              borderColor: STYLE_GUIDE.COLORS.inputFieldBorder,
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 20, color: STYLE_GUIDE.COLORS.textSecondary }} />
            </InputAdornment>
          ),
        }}
      />

      <Select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value as string)}
        size="small"
        displayEmpty
        sx={selectSx}
      >
        <MenuItem value="all">All</MenuItem>
        {typeOptions.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>

      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <MobileDatePicker
          views={["year", "month"]}
          value={selectedPeriod}
          onAccept={(val) => onPeriodChange(val)}
          disableFuture
          maxDate={DateTime.now()}
          slotProps={{
            textField: {
              size: "small",
              placeholder: "Period",
              sx: {
                width: 160,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  height: "40px",
                  backgroundColor: STYLE_GUIDE.COLORS.white,
                  "& fieldset": {
                    borderColor: STYLE_GUIDE.COLORS.inputFieldBorder,
                  },
                  "&:hover fieldset": {
                    borderColor: STYLE_GUIDE.COLORS.inputFieldBorder,
                  },
                },
                "& .MuiInputBase-input": {
                    fontSize: "14px",
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    "&::placeholder": {
                      color: STYLE_GUIDE.COLORS.tableBodyText,
                      opacity: 1,
                    },
                  },
              },
            },
            actionBar: {
              sx: {
                "& .MuiButton-root": {
                  color: STYLE_GUIDE.COLORS.themeColor,
                },
              },
            },
          }}
          format="MMM yyyy"
        />
      </LocalizationProvider>

      {isFilterActive && (
        <IconButton
          size="small"
          onClick={onReset}
          sx={{
            p: 0.5,
            color: STYLE_GUIDE.COLORS.textSecondary,
            border: `1px solid ${STYLE_GUIDE.COLORS.inputFieldBorder}`,
            borderRadius: "8px",
            "&:hover": {
              color: STYLE_GUIDE.COLORS.error,
              borderColor: STYLE_GUIDE.COLORS.error,
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )}
    </Box>
  );
}
