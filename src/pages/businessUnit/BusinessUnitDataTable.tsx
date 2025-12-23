import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  InputAdornment,
  Tooltip,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import useGet from "../../hooks/useGet";
import { CustomPagination } from "../../components/common/pagination/customPagination";
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
    width: 250,
    disableColumnMenu: true,
    resizable: true,
    sortable: true,
  },
  {
    field: "status",
    headerName: "Status",
    width: 250,
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
    width: 250,
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
    width: 250,
    disableColumnMenu: true,
    sortable: false,
    resizable: false,
    renderCell: (params) => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Edit" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleEdit(params.row)}
            sx={{ minWidth: "auto" }}
            disabled={!params.row.shouldAllowEdit}
          >
            <EditIcon />
          </Button>
        </Tooltip>
        <Tooltip title="View" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleView(params.row)}
            sx={{ minWidth: "auto" }}
          >
            <VisibilityIcon />
          </Button>
        </Tooltip>
        {/* <Tooltip title="Delete" arrow>
          <Button
            variant="text"
            onClick={() => params.row.handleDelete(params.row._id)}
            sx={{ minWidth: "auto", color: "error.main" }}
            disabled={!params.row._id}
          >
            <DeleteIcon />
          </Button>
        </Tooltip> */}
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
  setPaginationModel: (model: BUPaginationModelType) => void;
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
  onAddBusinessUnit,
  onEditBusinessUnit,
  onViewBusinessUnit,
  onDeleteBusinessUnit,
  // onFilter,
  searchValue,
  onSearchChange,
  paginationModel,
  setPaginationModel,
  //   filterValues,
  //   departmentReload,
  loading,
  shouldAllowAdd,
  shouldAllowEdit,
  shouldAllowDelete,
}: BusinessUnitDataTableProps) {
  const perPageItem = paginationModel.pageSize;

  const [searchBusinessUnit, setSearchBusinessUnit] = useState(searchValue);

  const [rowCountBusinessUnit, setRowCountBusinessUnit] = useState(0);

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
      setPaginationModel({ ...paginationModel, page: 0 });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

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

  useEffect(() => {
    if (businessUnitList?.data?.totalCount) {
      setRowCountBusinessUnit(businessUnitList.data.totalCount);
    }
  }, [businessUnitList?.data?.totalCount]);

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
            onChange={onSearchChange}
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

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddBusinessUnit}
              sx={{ borderRadius: "8px" }}
              disabled={!shouldAllowAdd}
            >
              Add
            </Button>
          </Box>
        </Box>

        <DataGrid
          loading={loading || businessUnitList.isPending}
          rows={businessUnitsWithIds}
          columns={columns}
          getRowId={(row) => row._id}
          paginationMode="server"
          rowCount={rowCountBusinessUnit}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableColumnMenu
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 20]}
          sx={{ overflow: "visible" }}
          slots={{
            pagination: () => (
              <CustomPagination
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
                rowCount={rowCountBusinessUnit}
              />
            ),
          }}
        />
      </CardContent>
    </Card>
  );
}
