import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import DialogContainer from "../../../components/molecule/dialog";
import { StyledButton } from "../../../components/common";
import { CustomPagination } from "../../../components/common/pagination/customPagination";
import { STYLE_GUIDE } from "../../../styles";
import { GET } from "../../../services/apiRoutes";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosInstance from "../../../services/axiosInstance";
import { CentralFile, ValidatedRowsResponse } from "../types";

interface FileViewModalProps {
  file: CentralFile | null;
  open: boolean;
  onClose: () => void;
  tabName?: string;
}

const headerCellSx = {
  fontWeight: 600,
  fontSize: "13px",
  color: STYLE_GUIDE.COLORS.tableHeaderText,
  backgroundColor: STYLE_GUIDE.COLORS.tableHeaderBackground,
  whiteSpace: "nowrap" as const,
  py: 1.5,
  borderBottom: `1px solid ${STYLE_GUIDE.COLORS.inputFieldBorder}`,
};

const bodyCellSx = {
  fontSize: "13px",
  color: STYLE_GUIDE.COLORS.tableBodyText,
  py: 1.5,
  whiteSpace: "nowrap" as const,
  borderBottom: `1px solid ${STYLE_GUIDE.COLORS.inputFieldBorder}`,
};

export default function FileViewModal({ file, open, onClose, tabName }: FileViewModalProps) {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const url = file
    ? `${GET.CENTRAL_FILES_VALIDATED_ROWS}?centralFileId=${file._id}&page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}`
    : "";

  const query = useQuery<ValidatedRowsResponse>({
    queryKey: ["centralFilesValidatedRows", file?._id ?? "", paginationModel.page + 1, paginationModel.pageSize],
    queryFn: async ({ signal }) => {
      const { data } = await axiosInstance.get<ValidatedRowsResponse>(url, { signal });
      return data;
    },
    enabled: open && !!file,
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(() => {
    const rows = query.data?.data;
    if (!rows || rows.length === 0) return [];
    return Object.keys(rows[0]);
  }, [query.data]);

  const rows = query.data?.data ?? [];
  const totalCount = query.data?.totalCount ?? 0;

  const handleClose = () => {
    setPaginationModel({ page: 0, pageSize: 10 });
    onClose();
  };

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      }
    }
    return String(value);
  };

  return (
    <DialogContainer
      open={open}
      onClose={handleClose}
      title={file?.filename ?? "File Preview"}
      maxWidth="lg"
      actions={
        <StyledButton variant="secondary" onClick={handleClose}>
          Close
        </StyledButton>
      }
    >
      {/* Metadata bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        {tabName && (
          <Chip
            label={tabName}
            size="small"
            sx={{
              height: "26px",
              fontSize: "12px",
              fontWeight: 600,
              color: STYLE_GUIDE.COLORS.tableBodyText,
              backgroundColor: STYLE_GUIDE.COLORS.inputFieldBackground,
              border: `1px solid ${STYLE_GUIDE.COLORS.inputFieldBorder}`,
            }}
          />
        )}
        {file && (
          <Typography
            variant="body2"
            sx={{ fontSize: "13px", fontWeight: 500, color: STYLE_GUIDE.COLORS.textSecondary }}
          >
            {file.year} / {file.month}
          </Typography>
        )}
        {totalCount > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <TableRowsOutlinedIcon sx={{ fontSize: 16, color: STYLE_GUIDE.COLORS.textSecondary }} />
            <Typography
              variant="body2"
              sx={{ fontSize: "13px", fontWeight: 500, color: STYLE_GUIDE.COLORS.textSecondary }}
            >
              {totalCount} rows
            </Typography>
          </Box>
        )}
        {columns.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ViewColumnOutlinedIcon sx={{ fontSize: 16, color: STYLE_GUIDE.COLORS.textSecondary }} />
            <Typography
              variant="body2"
              sx={{ fontSize: "13px", fontWeight: 500, color: STYLE_GUIDE.COLORS.textSecondary }}
            >
              {columns.length} columns
            </Typography>
          </Box>
        )}
      </Box>

      {query.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Typography
            variant="body2"
            sx={{ color: STYLE_GUIDE.COLORS.textSecondary, fontSize: "14px" }}
          >
            No data available for this file.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ position: "relative" }}>
          {query.isFetching && !query.isLoading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(255,255,255,0.6)",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
              }}
            />
          )}

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "8px",
              border: `1px solid ${STYLE_GUIDE.COLORS.inputFieldBorder}`,
              maxHeight: 480,
              minHeight: 400,
              overflow: "auto",
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col} sx={headerCellSx}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    sx={{
                      "&:hover": {
                        backgroundColor: `${STYLE_GUIDE.COLORS.themeColor}08`,
                      },
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell key={col} sx={bodyCellSx}>
                        {formatCellValue(row[col])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <CustomPagination
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
            rowCount={totalCount}
          />
        </Box>
      )}
    </DialogContainer>
  );
}
