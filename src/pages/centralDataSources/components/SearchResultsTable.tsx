import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { CentralFile } from "../types";
import { STYLE_GUIDE } from "../../../styles";
import { ActionIconButton, StatusChip } from "../../../components/common";
import { CustomPagination } from "../../../components/common/pagination/customPagination";

export interface SearchResultFile extends CentralFile {
  category?: string;
}

interface SearchResultsTableProps {
  files: SearchResultFile[];
  totalCount: number;
  paginationModel: { page: number; pageSize: number };
  setPaginationModel: (model: { page: number; pageSize: number }) => void;
  loading?: boolean;
  onView?: (file: CentralFile) => void;
  onMapping?: (file: CentralFile) => void;
  onDownload?: (file: CentralFile) => void;
  onDelete?: (file: CentralFile) => void;
  onReset: () => void;
}

const COLUMNS = ["Filename", "Added Date", "File Size", "Uploaded By", "Status", "Actions"];

const headerCellSx = {
  backgroundColor: STYLE_GUIDE.COLORS.inputFieldBackground,
  fontWeight: 600,
  fontSize: "13px",
  color: STYLE_GUIDE.COLORS.tableHeaderText,
  borderBottom: `1px solid ${STYLE_GUIDE.COLORS.tableBorder}`,
  py: 1.5,
  whiteSpace: "nowrap" as const,
};

const bodyCellSx = {
  fontSize: "13px",
  color: STYLE_GUIDE.COLORS.textSecondary,
  py: 1.5,
};

export default function SearchResultsTable({
  files,
  totalCount,
  paginationModel,
  setPaginationModel,
  loading,
  onView,
  onMapping,
  onDownload,
  onDelete,
  onReset,
}: SearchResultsTableProps) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontSize: "13px", color: STYLE_GUIDE.COLORS.textSecondary }}
        >
          Found {totalCount} file(s)
        </Typography>
        <Typography
          variant="body2"
          onClick={onReset}
          sx={{
            fontSize: "13px",
            color: STYLE_GUIDE.COLORS.themeColor,
            cursor: "pointer",
            fontWeight: 500,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Back to folder view
        </Typography>
      </Box>

      <Box sx={{ position: "relative" }}>
        {loading && (
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

        {files.length === 0 && !loading ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body2" color="textSecondary">
              No files match your search criteria.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: "none",
                border: `1px solid ${STYLE_GUIDE.COLORS.inputFieldBorder}`,
                borderRadius: "8px",
                overflow: "auto",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {COLUMNS.map((col) => (
                      <TableCell key={col} sx={headerCellSx}>
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file) => {
                    const isValidated = file.status === "validated";
                    const showMapping = !isValidated;

                    return (
                      <TableRow
                        key={file._id}
                        sx={{
                          "&:hover": {
                            backgroundColor: STYLE_GUIDE.COLORS.inputFieldBackground,
                          },
                        }}
                      >
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <DescriptionOutlinedIcon
                              sx={{ fontSize: 18, color: STYLE_GUIDE.COLORS.textSecondary }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "13px",
                                color: STYLE_GUIDE.COLORS.tableBodyText,
                                fontWeight: 500,
                              }}
                            >
                              {file.filename}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={bodyCellSx}>
                          {file.addedDate}
                        </TableCell>
                        <TableCell sx={bodyCellSx}>
                          {file.fileSize}
                        </TableCell>
                        <TableCell sx={bodyCellSx}>
                          {file.uploadedBy}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <StatusChip status={file.status} />
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {isValidated && (
                              <Tooltip title="View" arrow>
                                <ActionIconButton onClick={() => onView?.(file)}>
                                  <VisibilityOutlinedIcon />
                                </ActionIconButton>
                              </Tooltip>
                            )}

                            {showMapping && (
                              <Tooltip title="Mapping" arrow>
                                <ActionIconButton onClick={() => onMapping?.(file)}>
                                  <SyncAltIcon />
                                </ActionIconButton>
                              </Tooltip>
                            )}

                            {isValidated && (
                              <Tooltip title="Download" arrow>
                                <ActionIconButton onClick={() => onDownload?.(file)}>
                                  <FileDownloadOutlinedIcon />
                                </ActionIconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="Delete" arrow>
                              <ActionIconButton
                                onClick={() => onDelete?.(file)}
                                sx={{
                                  "&:hover": {
                                    backgroundColor: STYLE_GUIDE.COLORS.error + " !important",
                                    color: "#fff !important",
                                  },
                                }}
                              >
                                <DeleteOutlinedIcon />
                              </ActionIconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <CustomPagination
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
              rowCount={totalCount}
            />
          </>
        )}
      </Box>
    </Box>
  );
}
