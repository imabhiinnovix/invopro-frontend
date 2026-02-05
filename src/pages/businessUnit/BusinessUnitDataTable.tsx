import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Tooltip, Chip } from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import useGet from "../../hooks/useGet";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { ActionIconButton } from "../../components/common";
import SearchField from "../../components/common/SearchField";
import { GET } from "../../services/apiRoutes";
import { toast } from "react-toastify";
import { BUPaginationModelType } from ".";
import { formatDateWithoutTime } from "../../utils/utils";

interface BusinessUnitData {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
  permissions?: string[];
}

export interface BusinessUnitDataApiResponse {
  success: boolean;
  data: BusinessUnitData[];
  totalCount: number;
}
// createdAt: item.createdAt ? new Date(item.createdAt).getTime() : 0,
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
      <Chip
        label={params.value || "Unknown"}
        size="small"
        color={params.value === "active" ? "success" : "error"}
        variant="outlined"
      />
    ),
  },
  {
    field: "createdAt",
    headerName: "Created At",
    minWidth: 140,
    disableColumnMenu: true,
    resizable: true,
    sortable: true,
    renderCell: ({ row }) => {
      return row?.createdAt ? formatDateWithoutTime(row.createdAt) : "-";
    },
  },
  {
    field: "actions",
    headerName: "Actions",
    minWidth: 140,
    align: "center",
    headerAlign: "center",
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => (
      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", width: "100%" }}>
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
        <Tooltip title="Delete" arrow>
          <ActionIconButton
            onClick={() => params.row.handleDelete(params.row._id)}
            disabled={!params.row._id}
          >
            <DeleteOutlined />
          </ActionIconButton>
        </Tooltip>
      </Box>
    ),
  },
];

interface BusinessUnitDataTableProps {
  onAddBusinessUnit: () => void;
  onEditBusinessUnit: (row: BusinessUnitData) => void;
  onViewBusinessUnit: (row: BusinessUnitData) => void;
  onDeleteBusinessUnit: (id: string) => void;
  // onFilter: () => void;
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  paginationModel: BUPaginationModelType;
  setPaginationModel: React.Dispatch<React.SetStateAction<BUPaginationModelType>>;
  //   filterValues: {
  //     name: string;
  //     organizationId: string;
  //     status: string;
  //   };
  //   departmentReload: boolean;
  loading: boolean;
  shouldAllowAdd: boolean;
  shouldAllowEdit: boolean;
  shouldAllowDelete: boolean;
}

export function BusinessUnitDataTable({
  onAddBusinessUnit: _onAddBusinessUnit,
  onEditBusinessUnit,
  onViewBusinessUnit,
  onDeleteBusinessUnit,
  searchValue,
  onSearchChange,
  paginationModel,
  setPaginationModel,
  loading,
  shouldAllowAdd: _shouldAllowAdd,
  shouldAllowEdit,
  shouldAllowDelete,
}: BusinessUnitDataTableProps) {
  const perPageItem = paginationModel.pageSize;

  const [searchBusinessUnit, setSearchBusinessUnit] = useState(searchValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue.length === 0 || searchValue.trim() === "") {
        setSearchBusinessUnit("");
      } else if (searchValue.length < 3) {
        toast.warning("Please enter at least 3 characters");
        setSearchBusinessUnit("");
      } else {
        setSearchBusinessUnit(searchValue);
      }
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue, setPaginationModel]);

  const businessUnitList = useGet<BusinessUnitDataApiResponse>(
    [
      "businessUnitList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      searchBusinessUnit,
    ],
    `${GET.BUSINESS_UNIT_LIST}?page=${
      paginationModel.page + 1
    }&limit=${perPageItem}&search=${encodeURIComponent(searchBusinessUnit)}`,
    true
  );

  const businessUnitsWithIds =
    Array.isArray(businessUnitList?.data?.data) &&
    businessUnitList.data.data.length > 0
      ? businessUnitList.data.data.map((businessUnit) => ({
          ...businessUnit,
          id:
            businessUnit._id ||
            `temp-${Math.random().toString(36).substr(2, 9)}`,
          permissions: businessUnit.permissions || [],
          handleEdit: onEditBusinessUnit,
          handleView: onViewBusinessUnit,
          handleDelete: onDeleteBusinessUnit,
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
        loading={loading || businessUnitList.isPending}
        rows={businessUnitsWithIds}
        columns={columns}
        getRowId={(row) => row._id}
        pagination
        paginationMode="server"
        rowCount={businessUnitList?.data?.totalCount ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        disableColumnMenu
        disableVirtualization
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[10, 20, 50]}
        sx={{ overflow: "visible", width: "100%" }}
        slots={{
          pagination: () => (
            <CustomPagination
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
              rowCount={businessUnitList?.data?.totalCount ?? 0}
            />
          ),
        }}
      />
    </>
  );
}
