import * as React from "react";

import {
  Box,
  Typography,
  Button,
  Tooltip,
  Select,
  MenuItem,
} from "@mui/material";

import { STYLE_GUIDE } from "../../../styles";

// Custom Pagination Component
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

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        p: 1,
        backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
        // borderTop: `1px solid ${STYLE_GUIDE?.COLORS?.divider || "#e0e0e0"}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
        <Typography sx={{ mr: 1 }}>Rows per page:</Typography>
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
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
              "& fieldset": {
                borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
              },
              "&:hover fieldset": {
                borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
              },
            },
          }}
        >
          {pageSizeOptions.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Tooltip title="First Page" arrow>
        <span>
          <Button
            disabled={paginationModel.page === 0}
            onClick={() => setPaginationModel({ ...paginationModel, page: 0 })}
            sx={{
              minWidth: "auto",
              mx: 1,
              color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
              "&:hover": {
                backgroundColor:
                  STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
              },
              "&.Mui-disabled": {
                color: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
              },
            }}
          >
            <Typography>{"<<"}</Typography>
          </Button>
        </span>
      </Tooltip>
      <Tooltip title="Previous Page" arrow>
        <span>
          <Button
            disabled={paginationModel.page === 0}
            onClick={() =>
              setPaginationModel({
                ...paginationModel,
                page: paginationModel.page - 1,
              })
            }
            sx={{
              minWidth: "auto",
              mx: 1,
              color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
              "&:hover": {
                backgroundColor:
                  STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
              },
              "&.Mui-disabled": {
                color: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
              },
            }}
          >
            <Typography>{"<"}</Typography>
          </Button>
        </span>
      </Tooltip>
      <Typography sx={{ mx: 2 }}>
        Page {paginationModel.page + 1} of {totalPages}
      </Typography>
      <Tooltip title="Next Page" arrow>
        <span>
          <Button
            disabled={paginationModel.page >= totalPages - 1}
            onClick={() =>
              setPaginationModel({
                ...paginationModel,
                page: paginationModel.page + 1,
              })
            }
            sx={{
              minWidth: "auto",
              mx: 1,
              color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
              "&:hover": {
                backgroundColor:
                  STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
              },
              "&.Mui-disabled": {
                color: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
              },
            }}
          >
            <Typography>{">"}</Typography>
          </Button>
        </span>
      </Tooltip>
      <Tooltip title="Last Page" arrow>
        <span>
          <Button
            disabled={paginationModel.page >= totalPages - 1}
            onClick={() =>
              setPaginationModel({
                ...paginationModel,
                page: totalPages - 1,
              })
            }
            sx={{
              minWidth: "auto",
              mx: 1,
              color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
              "&:hover": {
                backgroundColor:
                  STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
              },
              "&.Mui-disabled": {
                color: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
              },
            }}
          >
            <Typography>{">>"}</Typography>
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
};
