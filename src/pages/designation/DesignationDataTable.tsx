import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Tooltip } from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import useGet from "../../hooks/useGet";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { ActionIconButton, StatusChip } from "../../components/common";
import SearchField from "../../components/common/SearchField";
import { GET } from "../../services/apiRoutes";
import { toast } from "react-toastify";

interface Designation {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
  permissions?: string[];
}

interface ApiResponse {
  success: boolean;
  data: Designation[];
  totalCount: number;
}

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Name",
    flex: 1,
    minWidth: 200,
    disableColumnMenu: true,
    resizable: true,
    sortable: true,
  },
  {
    field: "status",
    headerName: "Status",
    minWidth: 120,
    width: 150,
    disableColumnMenu: true,
    resizable: true,
    sortable: true,
    renderCell: (params) => (
      <StatusChip status={params.value === "active" ? "active" : "inactive"} label={params.value || "Unknown"} />
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    minWidth: 140,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Edit" arrow>
          <ActionIconButton
            onClick={() => params.row.handleEdit(params.row)}
            disabled={!params.row.shouldAllowEdit}
          >
            <EditOutlined />
          </ActionIconButton>
        </Tooltip>
        <Tooltip title="View" arrow>
          <ActionIconButton onClick={() => params.row.handleView(params.row)}>
            <VisibilityIcon />
          </ActionIconButton>
        </Tooltip>
        {/* <Tooltip title="Delete" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleDelete(params.row._id)}
            sx={{ minWidth: "auto", color: "error.main" }}
            disabled={!params.row._id}
          >
            <DeleteOutlined />
          </Button>
        </Tooltip> */}
      </Box>
    ),
  },
];

interface DesignationDataTableProps {
  onAddDesignation: () => void;
  onEditDesignation: (row: Designation) => void;
  onViewDesignation: (row: Designation) => void;
  onDeleteDesignation: (id: string) => void;
  onFilter: () => void;
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  paginationModel: { page: number; pageSize: number };
  setPaginationModel: React.Dispatch<React.SetStateAction<{ page: number; pageSize: number }>>;
  filterValues: {
    name: string;
    organizationId: string;
    status: string;
  };
  designationReload: boolean;
  loading: boolean;
  shouldAllowAdd: boolean;
  shouldAllowEdit: boolean;
  shouldAllowDelete: boolean;
}

export function DesignationDataTable({
  onAddDesignation: _onAddDesignation,
  onEditDesignation,
  onViewDesignation,
  onDeleteDesignation,
  onFilter: _onFilter,
  searchValue,
  onSearchChange,
  paginationModel,
  setPaginationModel,
  filterValues,
  designationReload,
  loading,
  shouldAllowAdd: _shouldAllowAdd,
  shouldAllowEdit,
  shouldAllowDelete,
}: DesignationDataTableProps) {
  const perPageItem = paginationModel.pageSize;

  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);

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
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  const designationList = useGet<ApiResponse>(
    [
      "designationList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
      String(designationReload),
      filterValues.name,
      filterValues.organizationId,
      filterValues.status,
    ],
    `${GET.DESIGNATION_LIST}?page=${
      paginationModel.page + 1
    }&limit=${perPageItem}&search=${encodeURIComponent(
      debouncedSearchValue
    )}&name=${encodeURIComponent(
      filterValues.name
    )}&organizationId=${encodeURIComponent(
      filterValues.organizationId
    )}&status=${encodeURIComponent(filterValues.status)}`,
    true
  );

  const designationsWithIds =
    Array.isArray(designationList?.data?.data) &&
    designationList.data.data.length > 0
      ? designationList.data.data.map((designation) => ({
          ...designation,
          id:
            designation._id ||
            `temp-${Math.random().toString(36).substr(2, 9)}`,
          permissions: designation.permissions || [],
          handleEdit: onEditDesignation,
          handleView: onViewDesignation,
          handleDelete: onDeleteDesignation,
          shouldAllowEdit,
          shouldAllowDelete,
        }))
      : [];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <SearchField
          searchValue={searchValue}
          handleSearchChange={onSearchChange}
        />
      </Box>

      <DataGrid
        rows={designationsWithIds}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[10, 20, 50]}
        disableColumnMenu
        disableVirtualization
        pagination
        paginationMode="server"
        rowCount={designationList?.data?.totalCount ?? 0}
        sx={{ overflow: "visible", width: "100%" }}
        loading={loading || designationList.isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        slots={{
          pagination: () => (
            <CustomPagination
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
              rowCount={designationList?.data?.totalCount ?? 0}
            />
          ),
        }}
      />
    </>
  );
}
