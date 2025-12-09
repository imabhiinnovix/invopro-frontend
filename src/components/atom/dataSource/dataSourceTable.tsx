import React, { useState, useEffect, useRef, useCallback } from "react";
import { styled } from "@mui/material/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  Skeleton,
  Typography,
  tableCellClasses,
  Chip,
} from "@mui/material";
import useGet from "../../../hooks/useGet";
import { GET } from "../../../services/apiRoutes";
import { DataSourceType } from "./types";
import CreateUpdateDataSource from "./createUpdateDataSource";
import { STYLE_GUIDE } from "../../../styles";
import { useComponentTypography } from "../../../hooks/useComponentTypography";
import CommonTable from "../../common/table";
import { formatDate } from "../../../utils/utils";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor:
      theme.palette.table?.headerBackground ||
      STYLE_GUIDE.COLORS.backgroundLightGray,
    color: theme.palette.table?.headerText || STYLE_GUIDE.COLORS.textGray,
    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.semiBold,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
    color: theme.palette.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor:
      theme.palette.table?.rowOddBackground ||
      STYLE_GUIDE.COLORS.backgroundDefault,
  },
  "&:nth-of-type(even)": {
    backgroundColor:
      theme.palette.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white,
  },
  "&:hover": {
    backgroundColor:
      theme.palette.table?.rowHoverBackground ||
      STYLE_GUIDE.COLORS.backgroundHover,
  },
}));

interface AttributeOptionTableProps {
  reload: boolean;
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
  shouldAllowEdit: boolean;
}

const DataSourceTable: React.FC<AttributeOptionTableProps> = ({
  reload,
  setReload,
  shouldAllowEdit,
}) => {
  const { getHeadingSx, getTableSx } = useComponentTypography();
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const perPageItem = 10;
  const observer = useRef<IntersectionObserver>();

  const dataSourceList = useGet<{
    success: boolean;
    data: DataSourceType[];
    totalCount: number;
  }>(
    [`dataSourceList-${currentPage}`],
    GET?.Data_Source_List + `?page=${currentPage}&limit=${perPageItem}`,
    !!currentPage
  );

  useEffect(() => {
    if (reload) {
      setCurrentPage(1);
      setDataSource([]);
      dataSourceList.refetch();
      setReload(false);
    }
  }, [reload, dataSourceList, setReload]);

  // Update data when API response changes
  useEffect(() => {
    if (dataSourceList?.data?.success && dataSourceList?.data?.data) {
      if (currentPage === 1) {
        setDataSource([...dataSourceList.data.data]);
      } else {
        setDataSource((prev) => {
          const existingIds = new Set(prev.map((item) => item._id));
          const newData = dataSourceList.data.data.filter(
            (item) => !existingIds.has(item._id)
          );
          return [...prev, ...newData];
        });
      }
    }
  }, [dataSourceList?.data, currentPage]);

  const hasMoreData =
    dataSource.length < (dataSourceList?.data?.totalCount || 0);

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (dataSourceList.isFetching || !hasMoreData) return;

      if (observer.current) {
        observer.current.disconnect();
      }

      // Create a new IntersectionObserver
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreData) {
            setCurrentPage((prevPage) => prevPage + 1);
          }
        },
        {
          root: null,
          rootMargin: "0px 0px 100px 0px",
          threshold: 0.1,
        }
      );

      if (node) {
        observer.current.observe(node);
      }
    },
    [dataSourceList.isFetching, hasMoreData]
  );

  useEffect(() => {
    console.log({
      currentPage,
      dataSourceLength: dataSource.length,
      totalCount: dataSourceList?.data?.totalCount,
      hasMoreData,
      isFetching: dataSourceList.isFetching,
    });
  }, [
    currentPage,
    dataSource.length,
    dataSourceList?.data?.totalCount,
    hasMoreData,
    dataSourceList.isFetching,
  ]);

  if (
    dataSourceList.isFetching &&
    currentPage === 1 &&
    dataSource.length === 0
  ) {
    return (
      <TableContainer component={Paper} sx={{ ...getTableSx() }}>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Skeleton variant="rectangular" height={50} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={40} />
        </Box>
      </TableContainer>
    );
  }

  if (!dataSourceList.isFetching && dataSource.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        sx={{ textAlign: "center", marginTop: 10 }}
        alignContent="center"
        alignItems="center"
      >
        <Typography
          variant="h4"
          sx={{
            ...getHeadingSx(),
            fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
            color: STYLE_GUIDE.COLORS.textDarkGray,
            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxl,
          }}
          gutterBottom
        >
          No data sources have been created yet. Please create a data source to
          display it here.
        </Typography>
      </Box>
    );
  }

  const columns = [
    {
      id: "name",
      label: "Name",
      minWidth: 170,
      sortable: true,
    },
    {
      id: "description",
      label: "Description",
      minWidth: 170,
      sortable: true,
    },
    {
      id: "code",
      label: "Code",
      minWidth: 170,
      sortable: true,
    },
    {
      id: "versionType",
      label: "Version Type",
      minWidth: 170,
      sortable: true,
    },
    {
      id: "entityName",
      label: "Entity Name",
      minWidth: 170,
      sortable: true,
      renderCell: (row: Record<string, unknown>) => {
        return row.entityId?.name || "-";
      },
    },
    {
      id: "createdBy",
      label: "Created By",
      minWidth: 170,
      sortable: true,
      renderCell: (row: Record<string, unknown>) => {
        return row.createdBy
          ? `${row.createdBy?.firstName} ${row.createdBy?.lastName}`
          : "-";
      },
    },
    {
      id: "updatedBy",
      label: "Updated By",
      minWidth: 170,
      sortable: true,
      renderCell: (row: Record<string, unknown>) => {
        console.log(row.updatedBy);
        return row.updatedBy?.firstName && row.updatedBy?.lastName
          ? `${row.updatedBy?.firstName} ${row.updatedBy?.lastName}`
          : "-";
      },
    },
    {
      id: "createdAt",
      label: "Created At",
      minWidth: 270,
      sortable: true,
      renderCell: (row: Record<string, unknown>) => {
        return row.createdAt ? formatDate(row.createdAt) : "-";
      },
    },
    {
      id: "updatedAt",
      label: "Updated At",
      minWidth: 270,
      sortable: true,
      renderCell: (row: Record<string, unknown>) => {
        return row.updatedAt ? formatDate(row.updatedAt) : "-";
      },
    },
    {
      id: "status",
      label: "Status",
      minWidth: 170,
      sortable: true,
      renderCell: (row: Record<string, unknown>) => {
        return row.isActive ? (
          <Chip label="Active" color="success" />
        ) : (
          <Chip label="Inactive" color="error" />
        );
      },
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 170,
      sortable: false,
      renderCell: (row: Record<string, unknown>) => {
        return (
          <CreateUpdateDataSource
            setReload={setReload}
            title="Update Data Source"
            CustomButton={<Button disabled={!shouldAllowEdit}>Edit</Button>}
            data={row as any}
          />
        );
      },
    },
  ];

  return (
    <CommonTable
      columns={columns}
      rows={dataSource}
      loading={dataSourceList.isFetching}
      height="calc(100vh - 250px)"
    />
  );

  return (
    <TableContainer
      component={Paper}
      sx={{
        ...getTableSx(),
        maxHeight: "600px",
        overflowY: "auto",
      }}
    >
      <Table sx={{ width: "100%" }} aria-label="data-source-table" stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell>NAME</StyledTableCell>
            <StyledTableCell>DESCRIPTION</StyledTableCell>
            <StyledTableCell>CODE</StyledTableCell>
            <StyledTableCell>VERSION TYPE</StyledTableCell>
            <StyledTableCell>ENTITY NAME</StyledTableCell>
            <StyledTableCell>CREATED BY</StyledTableCell>
            <StyledTableCell>UPDATED BY</StyledTableCell>
            <StyledTableCell>CREATED AT</StyledTableCell>
            <StyledTableCell>UPDATED AT</StyledTableCell>
            <StyledTableCell>STATUS</StyledTableCell>
            <StyledTableCell>ACTION</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataSource.map((data, index) => (
            <StyledTableRow
              key={data._id}
              ref={index === dataSource.length - 1 ? lastElementRef : null}
            >
              <StyledTableCell>{data.name || "-"}</StyledTableCell>
              <StyledTableCell>{data.description || "-"}</StyledTableCell>
              <StyledTableCell>{data.code || "-"}</StyledTableCell>
              <StyledTableCell>{data.versionType || "-"}</StyledTableCell>
              <StyledTableCell>{data.entityId?.name || "-"}</StyledTableCell>
              <StyledTableCell>
                {data.createdBy
                  ? `${data.createdBy.firstName} ${data.createdBy.lastName}`
                  : "-"}
              </StyledTableCell>
              <StyledTableCell>
                {data.updatedBy
                  ? `${data.updatedBy.firstName} ${data.updatedBy.lastName}`
                  : "-"}
              </StyledTableCell>
              <StyledTableCell>
                {data.createdAt
                  ? new Date(data.createdAt).toLocaleString()
                  : "-"}
              </StyledTableCell>
              <StyledTableCell>
                {data.updatedAt
                  ? new Date(data.updatedAt).toLocaleString()
                  : "-"}
              </StyledTableCell>
              <StyledTableCell>
                {data.isActive ? (
                  <Typography
                    sx={{
                      color: STYLE_GUIDE.COLORS.bootstrapSuccess,
                      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                    }}
                    component="span"
                  >
                    ACTIVE
                  </Typography>
                ) : (
                  <Typography
                    sx={{
                      color: STYLE_GUIDE.COLORS.bootstrapDanger,
                      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.small,
                    }}
                    component="span"
                  >
                    INACTIVE
                  </Typography>
                )}
              </StyledTableCell>
              <StyledTableCell title="Edit Data Source">
                <CreateUpdateDataSource
                  setReload={setReload}
                  title="Update Data Source"
                  CustomButton={<Button>Edit</Button>}
                  data={data}
                />
              </StyledTableCell>
            </StyledTableRow>
          ))}
          {dataSourceList.isFetching && currentPage > 1 && (
            <StyledTableRow>
              <StyledTableCell colSpan={11}>
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <Skeleton width="100%" height={40} />
                </Box>
              </StyledTableCell>
            </StyledTableRow>
          )}
          {!hasMoreData && dataSource.length > 0 && (
            <StyledTableRow>
              <StyledTableCell colSpan={11}>
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    All data loaded ({dataSource.length} of{" "}
                    {dataSourceList?.data?.totalCount} items)
                  </Typography>
                </Box>
              </StyledTableCell>
            </StyledTableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataSourceTable;
