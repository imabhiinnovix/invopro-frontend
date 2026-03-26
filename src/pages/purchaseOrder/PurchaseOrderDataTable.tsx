/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Box, Tooltip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditOutlined from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { ActionIconButton, StatusChip } from "../../components/common";

export function PurchaseOrderDataTable({
  onEdit,
  onView,
  onDelete,
  paginationModel,
  setPaginationModel,
  reload,
  loading,
}: any) {
  const perPageItem = paginationModel.pageSize;

  const poList = useGet(
    ["poList", paginationModel.page, paginationModel.pageSize, reload],
    `${GET.Purchase_Order_List}?page=${paginationModel.page + 1}&limit=${perPageItem}`,
    true
  );

  const columns: GridColDef[] = [
    { field: "poNumber", headerName: "PO Number", flex: 1, minWidth: 150 },
    {
      field: "vendor",
      headerName: "Vendor",
      flex: 1,
      minWidth: 200,
      disableColumnMenu: true,
      renderCell: (params) => params.row.vendorId?.name || "-",
    },    { field: "poValue", headerName: "PO Value", flex: 1, minWidth: 120 },
    { field: "poCurrency", headerName: "Currency", flex: 0.7, minWidth: 100 },
    { field: "balance_po_amount", headerName: "Balance Amount", flex: 1, minWidth: 120 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <StatusChip
          status={params.value === "Open" ? "active" : "inactive"}
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
              <ActionIconButton onClick={() => params.row.handleEdit(params.row)}>
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
              <ActionIconButton onClick={() => params.row.handleDelete(params.row._id)}>
                <DeleteOutlineIcon />
              </ActionIconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rows =
    Array.isArray(poList?.data?.data) && poList.data.data.length > 0
      ? poList.data.data.map((item: any) => ({
          ...item,
          id: item._id,
          handleEdit: onEdit,
          handleView: onView,
          handleDelete: onDelete,
        }))
      : [];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pagination
      paginationMode="server"
      rowCount={poList?.data?.totalCount ?? 0}
      pageSizeOptions={[10, 20, 50]}
      disableColumnMenu
      loading={loading || poList.isLoading}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      autoHeight
      slots={{
        pagination: () => (
          <CustomPagination
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
            rowCount={poList?.data?.totalCount ?? 0}
          />
        ),
      }}
    />
  );
}