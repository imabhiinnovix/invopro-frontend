import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { DELETE, GET } from "../../services/apiRoutes";
import useGet from "../../hooks/useGet";
import useDelete from "../../hooks/useDelete";
import { STYLE_GUIDE } from "../../styles";
import { NotivixDataTable } from "./NotivixDataTable";
import { Box, Button, Tooltip, Typography, Skeleton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { AttributeOptionRequestPayload } from "../../components/atom/attributeOption/types";
import { NotivixDataModal } from "./NotivixDataModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import NotivixFiltersModal from "../notivixDashboard/components/NotivixFiltersModal";
import { useComponentTypography } from "../../hooks";
import { checkPermission, formatDate } from "../../utils/utils";
import { DataSourceListPayload } from "../../components/atom/sideNav/types";
import { setDataSourceList } from "../dataSources/dataSourceActions";
import { useAppDispatch } from "../../storeHooks";
import { PermissionsMap } from "../../utils/constants";
import DialogContainer from "../../components/molecule/dialog";
import PrimaryButton from "../../components/common/PrimaryButton";

interface ApiResponse {
  data: any[];
  totalCount: number;
}

function getPermsForDataSource(
  dataSourceName: string,
  permissions: any,
  dataSourceCode: string
) {
  let permissionData = {
    shouldAllowAdd: false,
    shouldAllowEdit: false,
    shouldAllowDelete: false,
    shouldAllowImport: false,
  };
  if (dataSourceName == "CaseList" || dataSourceCode == "caselists") {
    const keys = ["case_list_create", "case_list_update", "case_list_delete"];
    permissionData.shouldAllowAdd = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[0]
    );
    permissionData.shouldAllowEdit = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[1]
    );
    permissionData.shouldAllowDelete = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[2]
    );
    permissionData.shouldAllowImport = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[0]
    );
  } else if (dataSourceName == "Formality Officer" || dataSourceCode == "formalityofficers") {
    const keys = [
      "formality_officers_create",
      "formality_officers_update",
      "formality_officers_delete",
    ];
    permissionData.shouldAllowAdd = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[0]
    );
    permissionData.shouldAllowEdit = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[1]
    );
    permissionData.shouldAllowDelete = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[2]
    );
    permissionData.shouldAllowImport = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[0]
    );
  } else if (dataSourceName == "IP Counsels" || dataSourceCode == "ipcounsels") {
    const keys = [
      "ip_counsel_create",
      "ip_counsel_update",
      "ip_counsel_delete",
    ];
    permissionData.shouldAllowAdd = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[0]
    );
    permissionData.shouldAllowEdit = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[1]
    );
    permissionData.shouldAllowDelete = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[2]
    );
    permissionData.shouldAllowImport = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[0]
    );
  } else if (dataSourceName == "Action Due" || dataSourceCode == "actiondues") {
    const keys = [
      "action_due_create",
      "action_due_update",
      "action_due_delete",
    ];
    permissionData.shouldAllowAdd = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[0]
    );
    permissionData.shouldAllowEdit = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[1]
    );
    permissionData.shouldAllowDelete = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[2]
    );
    permissionData.shouldAllowImport = checkPermission(
      permissions,
      PermissionsMap.DATA_SOURCE,
      keys[0]
    );
  }else if (dataSourceName && permissions) {
    const cleanedDataSourceName = dataSourceName
      .toLowerCase()
      .replace(" ", "_");
    const cleanedDataSourceCode = dataSourceCode
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();

    // extract permissions in which partial key matches with dataSourceName
    const partialKeyMatches = Object.keys(
      permissions[PermissionsMap.DATA_SOURCE]
    ).filter(
      (key) =>
        key.includes(cleanedDataSourceName) ||
        key.includes(cleanedDataSourceCode)
    );
    partialKeyMatches.forEach((key) => {
      const perm = checkPermission(
        permissions,
        PermissionsMap.DATA_SOURCE,
        key
      );
      if (key.includes("create")) {
        permissionData.shouldAllowAdd = perm;
        permissionData.shouldAllowImport = perm;
      } else if (key.includes("update")) {
        permissionData.shouldAllowEdit = perm;
      } else if (key.includes("delete")) {
        permissionData.shouldAllowDelete = perm;
      }
    });
  }

  return permissionData;
}

export default function NotivixDataSource() {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const { id: valueId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "view" | "filter" | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({ id: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [filter, setFilter] = useState({});
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const processingStatus = localStorage.getItem("dataSourceProcessingStatus");

  // Your existing API call with refreshKey dependency
  const dataSourceNotivixListAPI = useGet<DataSourceListPayload>(
    ["dataSourceNotivixList", refreshKey], // Add refreshKey to dependency array
    GET?.DATA_SOURCE_LIST + `?isShowMenu=true`
  );
  // Effect to update Redux when API data changes
  useEffect(() => {
    if (dataSourceNotivixListAPI.data?.success) {
      dispatch(setDataSourceList(dataSourceNotivixListAPI.data.data));
    }
  }, [dataSourceNotivixListAPI.data, dispatch]);

  // Effect to listen for status changes
  useEffect(() => {
    const handleStatusChange = () => {
      // Increment refreshKey to trigger API refetch
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("dataSourceStatusChanged", handleStatusChange);

    return () => {
      window.removeEventListener("dataSourceStatusChanged", handleStatusChange);
    };
  }, []);

  const { list } = useSelector((state: RootState) => state.dataSource);
  const listCurrentData = list?.find((item) => item._id === valueId);

  const deleteVersionRow = useDelete(["deleteVersionRow"]);

  const [isFiltersModalOpen, setIsFiltersModalOpen] = React.useState(false);
  const { getHeadingSx } = useComponentTypography();

  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions
  );

  const {
    shouldAllowAdd,
    shouldAllowEdit,
    shouldAllowDelete,
    shouldAllowImport,
  } = getPermsForDataSource(
    listCurrentData?.name || "",
    permissions,
    listCurrentData?.code || ""
  );

  const handleOpenFiltersModal = () => {
    setIsFiltersModalOpen(true);
  };

  const handleCloseFiltersModal = () => {
    setIsFiltersModalOpen(false);
  };
  const handleFilter = async (filters: any) => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "all")
    );
    setFilter(cleanedFilters);
  };

  // Reset page to 0 when search value changes
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

      // Reset to first page whenever search value changes
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
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
  useEffect(() => {
    setFilter({});
  }, [valueId]);

  const sourceVersionData = useGet<ApiResponse>(
    [
      "sourceVersionData",
      String(paginationModelMemo.page + 1),
      String(paginationModelMemo.pageSize),
      debouncedSearchValue,
      valueId || "",
      JSON.stringify(filter),
    ],
    `${GET.SOURCE_VERSION_DATA}?dataSourceId=${encodeURIComponent(
      valueId || ""
    )}&filters=${encodeURIComponent(JSON.stringify(filter))}&page=${
      paginationModelMemo.page + 1
    }&limit=${paginationModelMemo.pageSize}&search=${encodeURIComponent(
      debouncedSearchValue || ""
    )}`,
    !!valueId
  );

  const [showExportSuccessDialog, setShowExportSuccessDialog] = useState<
    string | null
  >(null);

  const sourceDataVersionExport = useGet<ApiResponse>(
    ["sourceDataVersionExport", valueId || ""],
    GET?.SOURCE_DATA_VERSION_EXPORT +
      `?dataSourceId=${encodeURIComponent(
        valueId || ""
      )}&sort=${encodeURIComponent(JSON.stringify({ Title: 1 }))}
      &selectedFields=${encodeURIComponent(JSON.stringify([]))}
      &filters=${encodeURIComponent(JSON.stringify(filter))}
      &search=${encodeURIComponent(debouncedSearchValue || "")}
      `,
    false
  );
  useEffect(() => {
    if (processingStatus === "completed") {
      queryClient.invalidateQueries({ queryKey: ["sourceVersionData"] });
      localStorage.removeItem("dataSourceProcessingStatus");
    }
  }, [processingStatus, queryClient]);

  const attributeList = useGet<{
    success: boolean;
    data: AttributeOptionRequestPayload[];
  }>([`attributeList`], GET?.Attribute_Option_List + `?paginate=false`);

  // Function to refresh data after successful save
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [
        "sourceVersionData",
        String(paginationModelMemo.page + 1),
        String(paginationModelMemo.pageSize),
        debouncedSearchValue,
        valueId || "",
      ],
    });
  }, [queryClient, paginationModelMemo, debouncedSearchValue, valueId]);

  useEffect(() => {
    if (sourceDataVersionExport.isSuccess && sourceDataVersionExport.data) {
      setShowExportSuccessDialog(
        "Your data has started exporting. You can view its status in the Jobs page."
      );
    }
  }, [
    sourceDataVersionExport.isSuccess,
    sourceDataVersionExport.data,
    sourceDataVersionExport.dataUpdatedAt,
  ]);

  const switchToEditMode = useCallback(() => {
    setModalMode("edit");
  }, []);

  const handleView = useCallback(
    (id: string) => {
      const rawData = sourceVersionData?.data?.data || [];
      if (rawData.length === 0) {
        return;
      }
      const row = rawData.find((r) => r._id === id || r.id === id);
      if (row) {
        const newFormData: Record<string, any> = { id: row._id || row.id };
        const dataSource = row.rowData || {};

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
    [sourceVersionData?.data?.data]
  );

  const handleEdit = useCallback(
    (id: string) => {
      const rawData = sourceVersionData?.data?.data || [];
      if (rawData.length === 0) {
        return;
      }
      const row = rawData.find((r) => r._id === id || r.id === id);
      if (row) {
        const newFormData: Record<string, any> = { id: row._id || row.id };
        const dataSource = row.rowData || {};

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

  const columns = useMemo(() => {
    if (!listCurrentData?.fieldSettings) {
      return [];
    }
    const displayFields =
      listCurrentData.fieldSettings.filter(
        (field) => field.isDisplayEnable && field.mappedAttributeName
      ) || [];
    const baseColumns = displayFields.map((field) => ({
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

    const actionsColumn = {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderHeader: () => <Typography>Actions</Typography>,
      renderCell: (params: any) => {
        if (params.row._id?.toString().startsWith("loading-placeholder-")) {
          return (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                py: 1,
              }}
            >
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          );
        }
        return (
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
                disabled={!shouldAllowEdit}
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
                disabled={!shouldAllowDelete}
                sx={{
                  minWidth: "auto",
                  color: STYLE_GUIDE?.COLORS?.error || "#d32f2f",
                }}
              >
                <DeleteIcon />
              </Button>
            </Tooltip>
          </Box>
        );
      },
    };

    return [...baseColumns, actionsColumn];
  }, [
    listCurrentData?.fieldSettings,
    handleView,
    handleEdit,
    handleDelete,
    shouldAllowEdit,
    shouldAllowDelete,
  ]);

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

  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
    setModalMode(null);
    setFormData({ id: "" });
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setDeleteId(null);
  }, []);

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
    } catch (error: any) {
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
    setLoading(sourceVersionData.isLoading || sourceVersionData.isFetching);
  }, [sourceVersionData.isLoading, sourceVersionData.isFetching]);

  useEffect(() => {
    if (sourceVersionData.isLoading || sourceVersionData.error) {
      if (sourceVersionData.error) {
        setRows([]);
        setRowCount(0);
      }
      return;
    }
    const rawData = sourceVersionData?.data?.data || [];
    const totalCount = sourceVersionData?.data?.totalCount || 0;
    if (!Array.isArray(rawData)) {
      setRows([]);
      setRowCount(0);
      return;
    }
    const displayFields =
      listCurrentData?.fieldSettings?.filter(
        (field) => field.isDisplayEnable && field.mappedAttributeName
      ) || [];
    const formattedRows = rawData.map((item) => {
      const row: Record<string, any> = { _id: item._id || item.id };
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
  }, [
    sourceVersionData.data,
    sourceVersionData.isLoading,
    sourceVersionData.error,
    listCurrentData?.fieldSettings,
  ]);

  const handleCompleteImport = () => {
    const id = listCurrentData?.dataSourceVersion?._id;
    if (id) {
      navigate(`/validation-errors/${id}`);
    } else {
      console.warn("No version ID found");
    }
  };

  const handleExport = () => {
    sourceDataVersionExport.refetch();
  };

  return (
    <Box
      sx={{
        p: STYLE_GUIDE?.SPACING?.s2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: STYLE_GUIDE?.SPACING?.s3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            ...getHeadingSx(),
          }}
        >
          {listCurrentData && listCurrentData?.name}
        </Typography>

        <Box sx={{ textAlign: "right" }}>
          {listCurrentData?.lastUploadedDate === null ? (
            ""
          ) : (
            <Typography variant="body2" color="text.secondary">
              Last updated : {formatDate(listCurrentData?.lastUploadedDate)}
            </Typography>
          )}

          {!listCurrentData?.dataSourceVersion ? (
            ""
          ) : listCurrentData?.dataSourceVersion?.status === "failed" ? (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: STYLE_GUIDE?.COLORS?.primaryDark || "#3f51b5",
                cursor: "pointer",
              }}
              onClick={handleCompleteImport}
            >
              Complete your import
            </Typography>
          ) : null}
        </Box>
      </Box>

      {/* <Typography
        variant="h4"
        sx={{
          ...getHeadingSx(),
          mb: STYLE_GUIDE?.SPACING?.s3,
        }}
      >
        {listCurrentData && listCurrentData?.name}
      </Typography> */}

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
        handleOpenFiltersModal={handleOpenFiltersModal}
        listCurrentData={listCurrentData}
        dataSourceId={valueId || ""}
        shouldAllowAdd={shouldAllowAdd}
        shouldAllowImport={shouldAllowImport}
        handleExport={handleExport}
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
      {valueId && (
        <NotivixFiltersModal
          open={isFiltersModalOpen}
          onClose={handleCloseFiltersModal}
          onApplyFilters={handleFilter}
          dataSourceId={valueId}
          filterFlag="isFilterEnable"
          currentFilters={filter}
        />
      )}
      {!!showExportSuccessDialog && (
        <DialogContainer
          open={!!showExportSuccessDialog}
          onClose={() => {
            setShowExportSuccessDialog(null);
          }}
          title="Export Data"
          actions={
            <>
              <PrimaryButton
                variant="contained"
                onClick={() => {
                  setShowExportSuccessDialog(null);
                  navigate("/jobs");
                }}
              >
                Go to Jobs
              </PrimaryButton>
            </>
          }
          maxWidth="xs"
        >
          <Typography>{showExportSuccessDialog}</Typography>
        </DialogContainer>
      )}
    </Box>
  );
}
