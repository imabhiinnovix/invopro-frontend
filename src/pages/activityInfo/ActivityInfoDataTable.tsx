import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Link, Tooltip } from "@mui/material";

import EditOutlined from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";

import { ActionIconButton, StatusChip } from "../../components/common";
import SearchField from "../../components/common/SearchField";
import { CustomPagination } from "../../components/common/pagination/customPagination";

export function ActivityInfoDataTable({
  onEdit,
  onView,
  onDelete,
  searchValue,
  onSearchChange,
  paginationModel,
  setPaginationModel,
  reload,
  loading,
}: any) {
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500);
    return () => clearTimeout(t);
  }, [searchValue]);

  const activityList = useGet<any>(
    [
      "activityList",
      paginationModel.page,
      paginationModel.pageSize,
      debouncedSearch,
      reload,
    ],
    `${GET.Activity_List}?page=${paginationModel.page + 1}&limit=${
      paginationModel.pageSize
    }&search=${debouncedSearch}`,
    true
  );

  const capitalize = (value: string) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const columns: GridColDef[] = [
  {
    field: "activityType",
    headerName: "Activity Type",
    flex: 1,
    renderCell: (params) => capitalize(params.row.activityType),
  },

    { field: "versionValue", headerName: "Billing Cycle", flex: 1 },

    {
      field: "files",
      headerName: "Files",
      flex: 1,
      renderCell: (params) => {
        const names = Array.isArray(params.row.activityFileName)
          ? params.row.activityFileName
          : [params.row.activityFileName];

        const paths = Array.isArray(params.row.activityFilePath)
          ? params.row.activityFilePath
          : [params.row.activityFilePath];

        return (
          <Box>
            {names.map((name: string, i: number) => (
              <Link key={i} href={`${import.meta.env.VITE_INVOICIVIX_BACKEND_URL}${paths[i]}`} target="_blank">
                {name}
              </Link>
            ))}
          </Box>
        );
      },
    },

    // {
    //   field: "analyze_processing_status",
    //   headerName: "Processing",
    //   flex: 1,
    //   renderCell: (params) => capitalize(params.row.analyze_processing_status),
    // },

    {
      field: "status",
      headerName: "Status",
      renderCell: (params) => (
        <StatusChip status={params.value} label={params.value} />
      ),
    },

    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit">
            <ActionIconButton onClick={() => onEdit(params.row)}>
              <EditOutlined />
            </ActionIconButton>
          </Tooltip>

          <Tooltip title="View">
            <ActionIconButton onClick={() => onView(params.row)}>
              <VisibilityIcon />
            </ActionIconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <ActionIconButton onClick={() => onDelete(params.row._id)}>
              <DeleteOutlineIcon />
            </ActionIconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rows =
    activityList?.data?.data?.map((item: any) => ({
      ...item,
      id: item._id,
    })) || [];

  return (
    <>
      <SearchField
        searchValue={searchValue}
        handleSearchChange={onSearchChange}
      />

      <DataGrid
        rows={rows}
        columns={columns}
        paginationMode="server"
        rowCount={activityList?.data?.totalCount || 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={loading || activityList.isLoading}
        slots={{
          pagination: () => (
            <CustomPagination
              paginationModel={paginationModel}
              setPaginationModel={setPaginationModel}
              rowCount={activityList?.data?.totalCount || 0}
            />
          ),
        }}
      />
    </>
  );
}