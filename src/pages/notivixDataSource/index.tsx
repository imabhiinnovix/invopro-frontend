import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { DELETE, GET } from "../../services/apiRoutes";
import useGet from "../../hooks/useGet";
import useDelete from "../../hooks/useDelete";
import { STYLE_GUIDE } from "../../styles";
import { NotivixDataTable } from "./NotivixDataTable";
import {
  Box,
  Button,
  CircularProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { AttributeOptionRequestPayload } from "../../components/atom/attributeOption/types";
import { NotivixDataModal } from "./NotivixDataModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface ApiResponse {
  data: any[];
  totalCount: number;
}

export default function NotivixDataSource() {
  const { id: valueId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [columns, setColumns] = useState<any[]>([]);
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

  // Create delete API hook
  const deleteVersionRow = useDelete(["deleteVersionRow"]);

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
      String(paginationModelMemo.pageSize),
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

  const attributeList = useGet<{
    success: boolean;
    data: AttributeOptionRequestPayload[];
  }>([`attributeList`], GET?.Attribute_Option_List + `?paginate=true`);

  // Function to refresh data after successful save
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries([
      "sourceVersionData",
      String(paginationModelMemo.page + 1),
      String(paginationModelMemo.pageSize),
      debouncedSearchValue,
      valueId || "",
    ]);
  }, [queryClient, paginationModelMemo, debouncedSearchValue, valueId]);

  // Function to switch to edit mode from view mode
  const switchToEditMode = useCallback(() => {
    setModalMode("edit");
  }, []);

  // Handler functions

  const handleView = useCallback(
    (id: string) => {
      const rawData = sourceVersionData?.data?.data || [];
      if (rawData.length === 0) {
        console.warn("Cannot edit: No data available");
        return;
      }
      const row = rawData.find((r) => r._id === id || r.id === id);
      if (row) {
        const newFormData: Record<string, any> = { id: row._id || row.id };
        const dataSource = row.rowData || {};
        console.log("rdataSource", dataSource);

        Object.keys(dataSource).forEach((key) => {
          if (key !== "_id" && key !== "id") {
            const value = dataSource[key];
            newFormData[key] = Array.isArray(value)
              ? value
              : value != null
                ? String(value)
                : "";
          }
        });

        setFormData(newFormData);
        setModalMode("view");
        setOpenModal(true);
      } else {
        console.error(`Row with ID ${id} not found`);
      }
    },
    [sourceVersionData?.data]
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
        const dataSource = row.rowData || {};
        console.log("rdataSource", dataSource);

        Object.keys(dataSource).forEach((key) => {
          if (key !== "_id" && key !== "id") {
            const value = dataSource[key];
            newFormData[key] = Array.isArray(value)
              ? value
              : value != null
                ? String(value)
                : "";
          }
        });

        setFormData(newFormData);
        setModalMode("edit");
        setOpenModal(true);
      } else {
        console.error(`Row with ID ${id} not found`);
      }
    },
    [sourceVersionData?.data]
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
    const filterFields =
      listCurrentData?.fieldSettings?.filter(
        (field) => field.isFilterEnable && field.mappedAttributeName
      ) || [];
    filterFields.forEach((field) => {
      const fieldName = field.mappedAttributeName;
      if (field.type === "boolean") {
        newFormData[fieldName] = false;
      } else if (field.type === "option" || field.type === "multioption") {
        newFormData[fieldName] = "";
      } else {
        newFormData[fieldName] = "";
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

  // Updated handleConfirmDelete to call delete API
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteId || !valueId) {
      toast.error("Missing required information for deletion");
      return;
    }

    try {
      await deleteVersionRow.mutateAsync({
        url: `${DELETE.DELETE_VERSION_ROW}`,
        payload: {
          dataSourceId: valueId,
          ids: [deleteId],
        },
      });

      toast.success("Record deleted successfully!");

      refreshData();

      handleCloseDialog();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error(`Error: ${error.message || "Failed to delete record"}`);
    }
  }, [deleteId, valueId, refreshData, handleCloseDialog, deleteVersionRow]);

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

  useEffect(() => {
    setLoading(sourceVersionData.isLoading);
  }, [sourceVersionData.isLoading]);

  useEffect(() => {
    if (sourceVersionData.error) {
      console.error("API error:", sourceVersionData.error);
      setRows([]);
      setRowCount(0);
      setColumns([]);
    }
  }, [sourceVersionData.error]);

  useEffect(() => {
    if (sourceVersionData.isLoading || sourceVersionData.error) {
      return;
    }
    const rawData = sourceVersionData?.data?.data || [];
    const totalCount = sourceVersionData?.data?.totalCount || 0;
    if (!Array.isArray(rawData)) {
      setRows([]);
      setRowCount(0);
      setColumns([]);
      return;
    }
    const displayFields =
      listCurrentData?.fieldSettings?.filter(
        (field) => field.isDisplayEnable && field.mappedAttributeName
      ) || [];
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
    setRows(formattedRows);
    setRowCount(totalCount);
    setColumns(columns);
  }, [sourceVersionData.data, listCurrentData?.fieldSettings]);

  useEffect(() => {
    if (columns.length === 0) return;
    const hasActionsColumn = columns.some((col) => col.field === "actions");
    if (hasActionsColumn) return;
    const actionsColumn = {
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

  if (loading && rows.length === 0) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    );
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

      <NotivixDataTable
        rows={rows}
        columns={columns}
        loading={loading}
        rowCount={rowCount}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        searchValue={searchValue}
        handleSearchChange={handleSearchChange}
        handleView={handleView}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleAddNotification={handleAddNotification}
        handleFilter={handleFilter}
        listCurrentData={listCurrentData}
        dataSourceId={valueId || ""}
      />

      <NotivixDataModal
        openModal={openModal}
        modalMode={modalMode}
        formData={formData}
        openDialog={openDialog}
        deleteId={deleteId}
        listCurrentData={listCurrentData}
        sourceVersionData={sourceVersionData}
        columns={columns}
        handleCloseModal={handleCloseModal}
        handleCloseDialog={handleCloseDialog}
        handleConfirmDelete={handleConfirmDelete}
        handleSave={handleSave}
        dataSourceId={valueId || ""}
        switchToEditMode={switchToEditMode}
        attributeListData={attributeList?.data?.data || []}
        setFormData={setFormData}
        refreshData={refreshData}
      />
    </Box>
  );
}
