import * as React from "react";

import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { STYLE_GUIDE } from "../../../styles";
import { KeyboardDoubleArrowLeftOutlined, KeyboardDoubleArrowRightOutlined } from "@mui/icons-material";

// Pagination design: clean footer with "Rows per page" left, "Page X of Y" + nav buttons right
const PAGINATION = {
  textColor: STYLE_GUIDE.COLORS.textSecondary,
  selectBg: "#F6F9FC",
  borderColor: "#E2E8F0",
  buttonBorderRadius: "8px",
};

type CustomPaginationProps = {
  paginationModel: { page: number; pageSize: number };
  setPaginationModel: (model: { page: number; pageSize: number }) => void;
  rowCount: number;
};

export const CustomPagination: React.FC<CustomPaginationProps> = ({
  paginationModel,
  setPaginationModel,
  rowCount,
}) => {
  const totalPages = Math.ceil(rowCount / paginationModel.pageSize) || 1;
  const pageSizeOptions = [10, 20, 50, 100];
  const isFirstDisabled = paginationModel.page === 0;
  const isLastDisabled = paginationModel.page >= totalPages - 1;

  const navButtonSx = {
    width: { xs: 28, sm: 32 },
    height: { xs: 28, sm: 32 },
    minWidth: { xs: 28, sm: 32 },
    padding: 0,
    border: `1px solid ${PAGINATION.borderColor}`,
    borderRadius: PAGINATION.buttonBorderRadius,
    backgroundColor: "#ffffff",
    color: PAGINATION.textColor,
    "&:hover": {
      backgroundColor: "#F6F9FC",
      borderColor: PAGINATION.borderColor,
    },
    "&.Mui-disabled": {
      backgroundColor: PAGINATION.selectBg,
      borderColor: PAGINATION.borderColor,
      color: "#A0AEC0",
    },
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "stretch", sm: "center" }}
      justifyContent="space-between"
      gap={{ xs: 1.5, sm: 0 }}
      sx={{ width: "100%", px: 0, py: 0, pt: 1.5 }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={{ xs: "space-between", sm: "flex-start" }}
        gap={1.5}
      >
        <Typography
          variant="body2"
          sx={{
            color: PAGINATION.textColor,
            fontSize: { xs: "13px", sm: "14px" },
          }}
        >
          Rows per page:
        </Typography>
        <Select
          value={paginationModel.pageSize}
          onChange={(e) =>
            setPaginationModel({
              ...paginationModel,
              pageSize: Number(e.target.value),
              page: 0,
            })
          }
          size="small"
          variant="outlined"
          sx={{
            minWidth: { xs: 64, sm: 70 },
            height: { xs: "28px !important", sm: "32px !important" },
            minHeight: { xs: "28px !important", sm: "32px !important" },
            backgroundColor: PAGINATION.selectBg,
            borderRadius: "12px",
            fontSize: { xs: "13px", sm: "14px" },
            color: PAGINATION.textColor,
            "& .MuiSelect-select": { py: { xs: 0.5, sm: 0.75 } },
            "&:hover .MuiOutlinedInput-notchedOutline, &:hover fieldset": {
              borderColor: PAGINATION.borderColor,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-focused fieldset": {
              borderColor: PAGINATION.borderColor,
              borderWidth: 1,
            },
          }}
        >
          {pageSizeOptions.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent={{ xs: "space-between", sm: "flex-start" }}
        gap={{ xs: 1, sm: 2 }}
      >
        <Typography
          variant="body2"
          sx={{
            color: PAGINATION.textColor,
            fontSize: { xs: "13px", sm: "14px" },
          }}
        >
          Page {paginationModel.page + 1} of {totalPages}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="First Page" arrow>
            <span>
              <IconButton
                size="small"
                disabled={isFirstDisabled}
                onClick={() =>
                  setPaginationModel({ ...paginationModel, page: 0 })
                }
                sx={navButtonSx}
              >
                <KeyboardDoubleArrowLeftOutlined sx={{ fontSize: "16px" }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Previous Page" arrow>
            <span>
              <IconButton
                size="small"
                disabled={isFirstDisabled}
                onClick={() =>
                  setPaginationModel({
                    ...paginationModel,
                    page: paginationModel.page - 1,
                  })
                }
                sx={navButtonSx}
              >
                <ChevronLeftIcon sx={{ fontSize: "16px" }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Next Page" arrow>
            <span>
              <IconButton
                size="small"
                disabled={isLastDisabled}
                onClick={() =>
                  setPaginationModel({
                    ...paginationModel,
                    page: paginationModel.page + 1,
                  })
                }
                sx={navButtonSx}
              >
                <ChevronRightIcon sx={{ fontSize: "16px" }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Last Page" arrow>
            <span>
              <IconButton
                size="small"
                disabled={isLastDisabled}
                onClick={() =>
                  setPaginationModel({
                    ...paginationModel,
                    page: totalPages - 1,
                  })
                }
                sx={navButtonSx}
              >
                <KeyboardDoubleArrowRightOutlined sx={{ fontSize: "16px" }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Stack>
    </Stack>
  );
};
