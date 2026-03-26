/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Tooltip } from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";
import { CustomPagination } from "../../components/common/pagination/customPagination";
import { ActionIconButton, StatusChip } from "../../components/common";

export function PaymentInfoDataTable({
  onEdit,
  onView,
  onDelete,
  paginationModel,
  setPaginationModel,
  reload,
  loading,
}: any) {
  const perPageItem = paginationModel.pageSize;

  const paymentList = useGet(
    ["paymentList", paginationModel.page, paginationModel.pageSize, reload],
    `${GET.Payment_List}?page=${paginationModel.page + 1}&limit=${perPageItem}`,
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
      field: "poNumber",
      headerName: "Purchase Order Number",
      flex: 1,
      minWidth: 200,
      disableColumnMenu: true,
      renderCell: (params) => params.row.purchaseOrderId?.poNumber || "-",
    },
    { field: "transactionId", headerName: "Transaction", flex: 1, minWidth: 150 },
    { field: "paymentCurrency", headerName: "Currency", flex: 0.7, minWidth: 100 },
    { field: "grossPaymentAmount", headerName: "Gross Amount", flex: 1, minWidth: 120 },
    { field: "taxDeduction", headerName: "Tax Deduction", flex: 1, minWidth: 120 },
    { field: "actualPaymentAmount", headerName: "Actual Payment", flex: 1, minWidth: 120 },
    {
      field: "paymentStatus",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <StatusChip
          status={params.value === "Paid" ? "active" : "inactive"}
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
    Array.isArray(paymentList?.data?.data) && paymentList.data.data.length > 0
      ? paymentList.data.data.map((item: any) => ({
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
      rowCount={paymentList?.data?.totalCount ?? 0}
      pageSizeOptions={[10, 20, 50]}
      disableColumnMenu
      loading={loading || paymentList.isLoading}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      autoHeight
      slots={{
        pagination: () => (
          <CustomPagination
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
            rowCount={paymentList?.data?.totalCount ?? 0}
          />
        ),
      }}
    />
  );
}