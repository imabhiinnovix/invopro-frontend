import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Modal,
  Tooltip,
  Chip,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { GET } from "../../services/apiRoutes";
import { toast } from "react-toastify";
import { STYLE_GUIDE } from "../../styles";
import { useComponentTypography } from "../../hooks";
import { formatDate } from "../../utils/utils";
import parse from "html-react-parser";

interface NotificationLog {
  _id: string;
  organizationId: string;
  notificationTypeId: {
    _id: string;
    name: string;
  };
  frequencySettingId: {
    frequency: string;
    triggerTime: string;
  };
  templateId: {
    subject: string;
    body: string;
  };
  mediumSettingId: {
    medium: string;
  };
  scheduledAt: string;
  notificationTriggerId: {
    source: string;
    isDryRun: boolean;
  };
  status: string;
  sentAt: string;
  payload: Record<string, any>;
  recipients: {
    recipient_to: string[];
    recipient_cc: string[];
  };
  alert_content: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: NotificationLog[];
  pagination: {
    totalRecords: number;
  };
}

const columns: GridColDef[] = [
  {
    field: "notificationTypeId",
    headerName: "Notification Type",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => params.row?.notificationTypeId?.name || "",
  },
  {
    field: "createdAt",
    headerName: "Created",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => formatDate(params.row.createdAt),
  },
  {
    field: "scheduledAt",
    headerName: "Trigger Date",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => formatDate(params.row.scheduledAt),
  },
  {
    field: "status",
    headerName: "Processing Status",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => (
      <Chip
        label={params.value || "Unknown"}
        size="small"
        color={
          params.value === "sent"
            ? "success"
            : params.value === "pending"
              ? "warning"
              : "error"
        }
        variant="outlined"
      />
    ),
  },
  {
    field: "notificationTriggerId",
    headerName: "Is Dry Run",
    width: 250,
    disableColumnMenu: true,
    resizable: true,
    renderCell: (params) => (
      <Chip
        label={params.row.notificationTriggerId?.isDryRun ? "Yes" : "No"}
        size="small"
        color={
          params.row.notificationTriggerId?.isDryRun ? "warning" : "success"
        }
        variant="outlined"
      />
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 250,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="View" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleView(params.row)}
            sx={{ minWidth: "auto" }}
          >
            <VisibilityIcon />
          </Button>
        </Tooltip>
      </Box>
    ),
  },
];

export default function NotificationLogger() {
  const theme = useUnifiedTheme();
  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [notificationLogReload, setNotificationLogReload] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationLog | null>(null);

  const { getHeadingSx } = useComponentTypography();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue.length === 0) {
        setDebouncedSearchValue("");
      } else if (searchValue.length < 3) {
        toast.warning("Please enter at least 3 characters");
        setDebouncedSearchValue("");
      } else {
        setDebouncedSearchValue(searchValue);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  const perPageItem = paginationModel.pageSize;
  const notificationLogList = useGet<ApiResponse>(
    [
      "notificationLogList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
      String(notificationLogReload),
    ],
    `${GET.NOTIFICATION_LOG_LIST}?page=${paginationModel.page + 1}&limit=${perPageItem}&search=${encodeURIComponent(debouncedSearchValue)}`,
    true
  );

  useEffect(() => {
    if (notificationLogList?.data && notificationLogReload) {
      setNotificationLogReload(false);
    }
  }, [notificationLogList, notificationLogReload]);

  const notificationLogsWithIds =
    Array.isArray(notificationLogList?.data?.data) &&
    notificationLogList.data.data.length > 0
      ? notificationLogList.data.data.map((notificationLog) => ({
          ...notificationLog,
          id:
            notificationLog._id ||
            `temp-${Math.random().toString(36).substr(2, 9)}`,
          handleView: (row: NotificationLog) => {
            setSelectedNotification(row);
            setViewModalOpen(true);
          },
        }))
      : [];

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedNotification(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  // Function to parse HTML content safely
  const parseHtmlContent = (html: string) => {
    if (!html) return null;

    try {
      return parse(html);
    } catch (error) {
      console.error("Error parsing HTML content:", error);
      return <div>Error rendering content</div>;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, ml: { xs: 0 }, minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{
          ...getHeadingSx(),
          mb: STYLE_GUIDE?.SPACING?.s3,
        }}
      >
        Notifications
      </Typography>
      <Card sx={{ borderRadius: "8px", overflow: "visible" }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <TextField
              placeholder="Search ..."
              variant="outlined"
              size="small"
              value={searchValue}
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
          </Box>
          <DataGrid
            rows={notificationLogsWithIds}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            disableColumnMenu
            paginationMode="server"
            sx={{ overflow: "visible" }}
            loading={notificationLogList.isLoading}
            rowCount={notificationLogList?.data?.pagination?.totalRecords || 0}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            slots={{
              pagination: () => (
                <CustomPagination
                  paginationModel={paginationModel}
                  setPaginationModel={setPaginationModel}
                  rowCount={
                    notificationLogList?.data?.pagination?.totalRecords || 0
                  }
                />
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* View Modal */}
      <Modal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            p: 3,
            width: "900px",
            maxWidth: "90%",
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Notification Details</Typography>
            <Button onClick={handleViewModalClose} sx={{ minWidth: "auto" }}>
              <CloseIcon />
            </Button>
          </Box>
          {selectedNotification && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Trigger date:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {formatDate(selectedNotification.scheduledAt)}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Is dry run:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {selectedNotification.notificationTriggerId?.isDryRun
                          ? "Yes"
                          : "No"}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Acknowledge:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">-</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Is acknowledged:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">No</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Is due date passed:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">No</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Report category:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">-</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Is active:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">Yes</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Created:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {formatDate(selectedNotification.createdAt)}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Notification type:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {selectedNotification.notificationTypeId?.name ||
                          "overall"}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Processing status:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Chip
                        label={selectedNotification.status || "Unknown"}
                        size="small"
                        color={
                          selectedNotification.status === "sent"
                            ? "success"
                            : selectedNotification.status === "pending"
                              ? "warning"
                              : "error"
                        }
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Notification medium:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {selectedNotification.mediumSettingId?.medium ||
                          "email"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    Recipients
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        To:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {selectedNotification.recipients?.recipient_to?.join(
                          ", "
                        ) || "No recipients"}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Cc:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {selectedNotification.recipients?.recipient_cc?.join(
                          ", "
                        ) || "No CC recipients"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    Email Content
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Subject:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {selectedNotification.templateId?.subject ||
                          "No subject"}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Alert Content:
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          p: 2,
                          maxHeight: "400px",
                          overflowY: "auto",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        {parseHtmlContent(selectedNotification.alert_content)}
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        File attached:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">-</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: STYLE_GUIDE.SPACING.s2,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleViewModalClose}
              sx={{
                borderRadius: "8px",
                borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
              }}
            >
              Cancel
            </Button>
          </Box>{" "}
        </Box>
      </Modal>
    </Box>
  );
}
