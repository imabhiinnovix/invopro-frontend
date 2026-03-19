import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Tooltip, Link } from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useGet from "../../hooks/useGet";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { ActionIconButton, StatusChip } from "../../components/common";
import SearchField from "../../components/common/SearchField";
import { GET } from "../../services/apiRoutes";
import { toast } from "react-toastify";

interface VendorInvoice {
  _id: string;
  vendorId?: { _id: string; name: string };
  versionValue: string;
  status: "active" | "inactive";
  fileName?: string | string[]; // single or multiple files
  filePath?: string | string[];
}

interface ApiResponse {
  success: boolean;
  data: VendorInvoice[];
  totalCount: number;
}

interface VendorInvoiceDataTableProps {
  onEdit: (row: VendorInvoice) => void;
  onView: (row: VendorInvoice) => void;
  onDelete: (id: string) => void;
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  paginationModel: { page: number; pageSize: number };
  setPaginationModel: React.Dispatch<
    React.SetStateAction<{ page: number; pageSize: number }>
  >;
  reload: boolean;
  loading: boolean;
  shouldAllowEdit: boolean;
  shouldAllowDelete: boolean;
}

export function VendorInvoiceDataTable({
  onEdit,
  onView,
  onDelete,
  searchValue,
  onSearchChange,
  paginationModel,
  setPaginationModel,
  reload,
  loading,
  shouldAllowEdit,
  shouldAllowDelete,
}: VendorInvoiceDataTableProps) {
  const perPageItem = paginationModel.pageSize;
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [searchWarningShown, setSearchWarningShown] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue.length === 0) {
        setDebouncedSearchValue("");
        setSearchWarningShown(false);
      } else if (searchValue.length < 3) {
        if (!searchWarningShown) {
          toast.warning("Please enter at least 3 characters");
          setSearchWarningShown(true);
        }
        setDebouncedSearchValue("");
      } else {
        setDebouncedSearchValue(searchValue);
        setSearchWarningShown(false);
      }
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchValue, setPaginationModel, searchWarningShown]);

  const vendorInvoiceList = useGet<ApiResponse>(
    [
      "vendorInvoiceList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
      String(reload),
    ],
    `${GET.Vendor_Invoice_List}?page=${paginationModel.page + 1}&limit=${perPageItem}&search=${encodeURIComponent(
      debouncedSearchValue
    )}`,
    true
  );

  const columns: GridColDef[] = [
    {
      field: "vendor",
      headerName: "Vendor",
      flex: 1,
      minWidth: 200,
      disableColumnMenu: true,
      renderCell: (params) => params.row.vendorId?.name || "-",
    },
    {
      field: "versionValue",
      headerName: "Version (YYYY-MM)",
      flex: 1,
      minWidth: 150,
      disableColumnMenu: true,
    },
    {
      field: "files",
      headerName: "Files",
      flex: 1,
      minWidth: 200,
      disableColumnMenu: true,
      renderCell: (params) => {
        const fileNames = Array.isArray(params.row.fileName)
          ? params.row.fileName
          : params.row.fileName
          ? [params.row.fileName]
          : [];
        const filePaths = Array.isArray(params.row.filePath)
          ? params.row.filePath
          : params.row.filePath
          ? [params.row.filePath]
          : [];

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {fileNames.map((name, index) => (
              <Link
                key={index}
                href={filePaths[index]}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                {name}
              </Link>
            ))}
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      renderCell: (params) => (
        <StatusChip
          status={params.value === "active" ? "active" : "inactive"}
          label={params.value}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 160,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit" arrow>
            <span>
              <ActionIconButton
                onClick={() => params.row.handleEdit(params.row)}
                disabled={!params.row.shouldAllowEdit}
              >
                <EditOutlined />
              </ActionIconButton>
            </span>
          </Tooltip>

          <Tooltip title="View" arrow>
            <ActionIconButton onClick={() => params.row.handleView(params.row)}>
              <VisibilityIcon />
            </ActionIconButton>
          </Tooltip>

          <Tooltip title="Delete" arrow>
            <span>
              <ActionIconButton
                onClick={() => params.row.handleDelete(params.row._id)}
                disabled={!params.row.shouldAllowDelete}
              >
                <DeleteOutlineIcon />
              </ActionIconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rows =
    Array.isArray(vendorInvoiceList?.data?.data) &&
    vendorInvoiceList.data.data.length > 0
      ? vendorInvoiceList.data.data.map((item) => ({
          ...item,
          id: item._id,
          handleEdit: onEdit,
          handleView: onView,
          handleDelete: onDelete,
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
        <SearchField searchValue={searchValue} handleSearchChange={onSearchChange} />
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        pagination
        paginationMode="server"
        rowCount={vendorInvoiceList?.data?.totalCount ?? 0}
        pageSizeOptions={[10, 20, 50]}
        disableColumnMenu
        disableVirtualization
        loading={loading || vendorInvoiceList.isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sx={{ width: "100%" }}
        slots={{
          pagination: () => (
            <CustomPagination
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
              rowCount={vendorInvoiceList?.data?.totalCount ?? 0}
            />
          ),
        }}
      />
    </>
  );
}