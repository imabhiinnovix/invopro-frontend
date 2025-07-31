import * as React from "react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { GET } from "../../services/apiRoutes";
import useGet from "../../hooks/useGet";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

interface ApiResponse {
  data: any[];
  totalCount: number;
}

export default function NotifixDataSource() {
  const { id: valueId } = useParams<{ id: string }>();
  const [rows, setRows] = useState<any[]>([]);
  const rowsRef = useRef<any[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "filter" | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({ id: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const { list } = useSelector((state: RootState) => state.dataSource);
  const listCurrentData = list.find((item) => item._id === valueId);

  console.log("List Current Data:", listCurrentData?.fieldSettings);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  // Memoize paginationModel
  const paginationModelMemo = useMemo(
    () => ({
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
    }),
    [paginationModel.page, paginationModel.pageSize]
  );

  const sourceVersionData = useGet<ApiResponse>(
    [
      "sourceVersionData",
      String(paginationModelMemo.page + 1),
      String(paginationModel.pageSize),

      debouncedSearchValue,
      valueId || "",
    ],
    `${GET.SOURCE_VERSION_DATA}?dataSourceId=${encodeURIComponent(
      valueId || ""
    )}&page=${paginationModelMemo.page + 1}&limit=${
      paginationModelMemo.pageSize
    }&query=${encodeURIComponent(debouncedSearchValue || "")}`,
    !!valueId
  );

  // Memoize handler functions
  const handleView = useCallback(
    (id: string) => {
      const rawData = sourceVersionData?.data?.data || [];
      if (rawData.length === 0) {
        console.warn("Cannot view: No data available");
        return;
      }
      const row = rawData.find((r) => r._id === id || r.id === id);
      if (row) {
        const newFormData: Record<string, any> = { id: row._id || row.id };
        const dataSource = row.rowData || row;
        Object.keys(dataSource).forEach((key) => {
          if (key !== "_id" && key !== "id") {
            newFormData[key] =
              dataSource[key] != null ? String(dataSource[key]) : "";
          }
        });
        setFormData(newFormData);
        setModalMode("view");
        setOpenModal(true);
      } else {
        console.error(`Row with ID ${id} not found`);
      }
    },
    [sourceVersionData.data]
  );

  const handleEdit = useCallback(
    (id: string) => {
      const rawData = sourceVersionData?.data?.data || [];
      if (rawData.length === 0) {
        console.warn("Cannot edit: No data available");
        return;
      }
      const row = rawData.find((r) => r._id === id || r.id === id);
      if (row) {
        const newFormData: Record<string, any> = { id: row._id || row.id };
        const dataSource = row.rowData || row;
        Object.keys(dataSource).forEach((key) => {
          if (key !== "_id" && key !== "id") {
            newFormData[key] =
              dataSource[key] != null ? String(dataSource[key]) : "";
          }
        });
        setFormData(newFormData);
        setModalMode("edit");
        setOpenModal(true);
      } else {
        console.error(`Row with ID ${id} not found`);
      }
    },
    [sourceVersionData.data]
  );

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
    setOpenDialog(true);
  }, []);

  const handleAddNotification = useCallback(() => {
    const newFormData: Record<string, any> = { id: "" };
    columns
      .filter((col) => col.field !== "actions" && col.field !== "_id")
      .forEach((col) => {
        newFormData[col.field] = "";
      });
    setFormData(newFormData);
    setModalMode("add");
    setOpenModal(true);
  }, [columns]);

  const handleFilter = useCallback(() => {
    const newFormData: Record<string, any> = { id: "" };
    // Initialize form data with default values based on field type
    const filterFields =
      listCurrentData?.fieldSettings?.filter(
        (field) => field.isFilterEnable && field.mappedAttributeName
      ) || [];
    filterFields.forEach((field) => {
      const fieldName = field.mappedAttributeName;
      if (field.type === "boolean") {
        newFormData[fieldName] = false; // Default for boolean
      } else if (field.type === "option" || field.type === "multioption") {
        newFormData[fieldName] = ""; // Default for dropdown
      } else {
        newFormData[fieldName] = ""; // Default for text
      }
    });
    setFormData(newFormData);
    setModalMode("filter");
    setOpenModal(true);
  }, [listCurrentData?.fieldSettings]);

  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
    setModalMode(null);
    setFormData({ id: "" });
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setDeleteId(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    setRows((prevRows) => prevRows.filter((row) => row._id !== deleteId));
    setRowCount((prev) => prev - 1);
    handleCloseDialog();
  }, [deleteId, handleCloseDialog]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.slice(0, 200);
      setSearchValue(value);
    },
    []
  );

  const handleSave = useCallback(() => {
    if (modalMode === "add") {
      console.log("Adding new:", formData);
    } else if (modalMode === "edit") {
      console.log("Saving edited row:", formData);
    } else if (modalMode === "filter") {
      console.log("Applying filter:", formData);
    }
    handleCloseModal();
  }, [formData, modalMode, handleCloseModal]);

  // Handle loading state
  useEffect(() => {
    setLoading(sourceVersionData.isLoading);
  }, [sourceVersionData.isLoading]);

  // Handle error state and reset data
  useEffect(() => {
    if (sourceVersionData.error) {
      console.error("API error:", sourceVersionData.error);
      setRows([]);
      rowsRef.current = [];
      setRowCount(0);
      setColumns([]);
    }
  }, [sourceVersionData.error]);

  console.log("Source Version Data:", sourceVersionData);

  // Handle data processing
  useEffect(() => {
    if (sourceVersionData.isLoading || sourceVersionData.error) {
      return;
    }

    const rawData = sourceVersionData?.data?.data || [];
    const totalCount = sourceVersionData?.data?.totalCount || 0;

    if (!Array.isArray(rawData)) {
      setRows([]);
      rowsRef.current = [];
      setRowCount(0);
      setColumns([]);
      return;
    }

    // Filter fieldSettings to include only those with isDisplayEnable: true
    const displayFields =
      listCurrentData?.fieldSettings?.filter(
        (field) => field.isDisplayEnable && field.mappedAttributeName
      ) || [];

    // Create columns for the table
    const columns = displayFields.map((field) => ({
      field: field.mappedAttributeName,
      headerName: field.label,
      flex: 1,
      sortable: field.isSortingEnable,
      renderHeader: (params: any) => {
        const headerText = params.colDef.headerName || "";
        return headerText.length > 10 ? (
          <Tooltip title={headerText} arrow>
            <Typography
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {headerText}
            </Typography>
          </Tooltip>
        ) : (
          <Typography>{headerText}</Typography>
        );
      },
      renderCell: (params: any) => {
        const cellValue = params.value != null ? String(params.value) : "";
        return cellValue.length > 10 ? (
          <Tooltip title={cellValue} arrow>
            <Typography
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {cellValue}
            </Typography>
          </Tooltip>
        ) : (
          <Typography>{cellValue}</Typography>
        );
      },
    }));

    // Format rows to include only the fields that are display-enabled
    const formattedRows = rawData.map((item) => {
      const row = { _id: item._id || item.id };
      displayFields.forEach((field) => {
        row[field.mappedAttributeName] =
          item.rowData?.[field.mappedAttributeName] ||
          item[field.mappedAttributeName] ||
          "";
      });
      return row;
    });

    console.log("Formatted Rows:", formattedRows);
    console.log("Columns:", columns);

    setRows(formattedRows);
    rowsRef.current = formattedRows;
    setRowCount(totalCount);
    setColumns(columns);
  }, [sourceVersionData.data, listCurrentData?.fieldSettings]);

  // Add actions column separately to avoid circular dependency
  useEffect(() => {
    if (columns.length === 0) {
      return;
    }

    // Check if actions column already exists
    const hasActionsColumn = columns.some((col) => col.field === "actions");
    if (hasActionsColumn) {
      return;
    }

    const actionsColumn: GridColDef = {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderHeader: () => <Typography>Actions</Typography>,
      renderCell: (params: any) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="View" arrow>
            <Button
              size="small"
              onClick={() => handleView(params.row._id)}
              sx={{
                minWidth: "auto",
                color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
              }}
            >
              <VisibilityIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Edit" arrow>
            <Button
              size="small"
              onClick={() => handleEdit(params.row._id)}
              sx={{
                minWidth: "auto",
                color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
              }}
            >
              <EditIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <Button
              size="small"
              onClick={() => handleDelete(params.row._id)}
              sx={{
                minWidth: "auto",
                color: STYLE_GUIDE?.COLORS?.error || "#d32f2f",
              }}
            >
              <DeleteIcon />
            </Button>
          </Tooltip>
        </Box>
      ),
    };

    setColumns((prev) => [...prev, actionsColumn]);
  }, [columns, handleView, handleEdit, handleDelete]);

  // Render Modal Fields
  const renderModalFields = () => {
    if (modalMode === "view" || modalMode === "edit") {
      // For view and edit, show all fields in formData
      const fields = Object.keys(formData)
        .filter((key) => key !== "id" && key !== "_id")
        .map((key) => (
          <TextField
            key={key}
            label={key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}
            value={formData[key] || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [key]: e.target.value }))
            }
            disabled={modalMode === "view"}
            variant="outlined"
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        ));

      return fields.length > 0 ? (
        fields
      ) : (
        <Typography>No fields available to display.</Typography>
      );
    } else if (modalMode === "filter") {
      // For filter, use fields where isFilterEnable is true
      const filterFields =
        listCurrentData?.fieldSettings?.filter(
          (field) => field.isFilterEnable && field.mappedAttributeName
        ) || [];

      const fields = filterFields.map((field) => {
        const fieldName = field.mappedAttributeName;
        const fieldLabel = field.label;

        if (field.type === "boolean") {
          return (
            <FormControlLabel
              key={fieldName}
              control={
                <Checkbox
                  checked={!!formData[fieldName]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [fieldName]: e.target.checked,
                    }))
                  }
                  sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
                />
              }
              label={fieldLabel}
              sx={{ mb: 1 }}
            />
          );
        } else if (field.type === "option" || field.type === "multioption") {
          // Collect unique values from data for dropdown options
          const rawData = sourceVersionData?.data?.data || [];
          const options = Array.from(
            new Set(
              rawData
                .map(
                  (item) => item.rowData?.[fieldName] || item[fieldName] || ""
                )
                .filter((value) => value !== "")
            )
          );

          return (
            <FormControl
              key={fieldName}
              variant="outlined"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            >
              <InputLabel>{fieldLabel}</InputLabel>
              <Select
                value={formData[fieldName] || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [fieldName]: e.target.value,
                  }))
                }
                label={fieldLabel}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        } else {
          // Default to text input
          return (
            <TextField
              key={fieldName}
              label={fieldLabel}
              value={formData[fieldName] || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [fieldName]: e.target.value,
                }))
              }
              variant="outlined"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />
          );
        }
      });

      return fields.length > 0 ? (
        fields
      ) : (
        <Typography>No filterable fields available.</Typography>
      );
    } else {
      // For add, use columns based on fieldSettings
      const fields = columns
        .filter((col) => col.field !== "actions" && col.field !== "_id")
        .map((col) => (
          <TextField
            key={col.field}
            label={col.headerName}
            value={formData[col.field] || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [col.field]: e.target.value }))
            }
            variant="outlined"
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        ));

      return fields.length > 0 ? (
        fields
      ) : (
        <Typography>No fields available to display.</Typography>
      );
    }
  };

  if (loading && rows.length === 0) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        ml: { xs: 0 },
        backgroundColor: STYLE_GUIDE?.COLORS?.backgroundLight || "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 400,
          color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
        }}
      >
        {listCurrentData && listCurrentData?.name}
      </Typography>

      <Card
        sx={{
          backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          overflow: "visible",
        }}
      >
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
              placeholder="Search..."
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
              sx={{
                width: "300px",
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilter}
                sx={{
                  borderRadius: "8px",
                  borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                  color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  "&:hover": {
                    backgroundColor:
                      STYLE_GUIDE?.COLORS?.backgroundDefault || "#f1f5f9",
                    borderColor: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  },
                }}
              >
                Filter
              </Button>
              {/* <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNotification}
                sx={{
                  borderRadius: "8px",
                  backgroundColor:
                    STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                  "&:hover": {
                    backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                  },
                }}
              >
                Add
              </Button> */}
            </Box>
          </Box>

          {rows.length > 0 ? (
            <DataGrid
              loading={loading}
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              paginationMode="server"
              rowCount={rowCount}
              paginationModel={paginationModelMemo}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 20]}
              disableColumnMenu
              slots={{
                pagination: () => (
                  <CustomPagination
                    paginationModel={paginationModelMemo}
                    setPaginationModel={setPaginationModel}
                    rowCount={rowCount}
                  />
                ),
              }}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
                textAlign: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: STYLE_GUIDE?.COLORS?.black || "#000000",
                  mb: 1,
                  opacity: 0.6,
                }}
              >
                No Data Available
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: STYLE_GUIDE?.COLORS?.black || "#000000",
                  opacity: 0.6,
                }}
              >
                No records found.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            p: 3,
            width: "600px",
            maxWidth: "90%",
            maxHeight: "600px",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
          >
            {modalMode === "add"
              ? "Add"
              : modalMode === "edit"
                ? "Edit"
                : modalMode === "view"
                  ? "View"
                  : "Filter"}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
            }}
          >
            {renderModalFields()}
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              sx={{
                borderRadius: "8px",
                borderColor: STYLE_GUIDE?.COLORS?.divider || "#e0e0e0",
                color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
              }}
            >
              Cancel
            </Button>
            {modalMode !== "view" && (
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  borderRadius: "8px",
                  backgroundColor:
                    STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                  color: STYLE_GUIDE?.COLORS?.white || "#ffffff",
                  "&:hover": {
                    backgroundColor: STYLE_GUIDE?.COLORS?.primary || "#5c6bc0",
                  },
                }}
              >
                {modalMode === "filter" ? "Apply" : "Save"}
              </Button>
            )}
          </Box>
        </Box>
      </Modal>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "8px",
            backgroundColor: STYLE_GUIDE?.COLORS?.white || "#ffffff",
          },
        }}
      >
        <DialogTitle
          sx={{ color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5" }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the notification with ID {deleteId}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              borderRadius: "8px",
              color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
            }}
          >
            No
          </Button>
          <Button
            onClick={handleConfirmDelete}
            sx={{
              borderRadius: "8px",
              backgroundColor: STYLE_GUIDE?.COLORS?.error || "#d32f2f",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: STYLE_GUIDE?.COLORS?.error || "#b71c1c",
              },
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
