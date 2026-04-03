import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Typography,
  tableCellClasses,
  Collapse,
  IconButton,
} from "@mui/material";

import { useParams } from "react-router-dom";
import useGet from "../../../hooks/useGet";
import { GET } from "../../../services/apiRoutes";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ErrorDialog from "./showError";
import { STYLE_GUIDE } from "../../../styles";
import { useComponentTypography } from "../../../hooks/useComponentTypography";
import CommonTable from "../../common/table";
import { PageCardLayout, StatusChip } from "../../common";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor:
      theme.palette.table?.headerBackground ||
      STYLE_GUIDE.COLORS.backgroundLightGray,
    color: theme.palette.table?.headerText || STYLE_GUIDE.COLORS.textGray,
    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
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
}));

interface Props {
  reload: boolean;
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataSourceVersionTable: React.FC<Props> = ({
  reload,
  setReload,
}) => {
  const { getHeadingSx } = useComponentTypography();
  const { dataSourceId } = useParams();

  const [dataSourceVersion, setDataSourceVersion] = useState<any[]>([]);
  const [hasProcessingItems, setHasProcessingItems] = useState(false);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const dataSourceVersionList = useGet<{
    success: boolean;
    data: any[];
    totalCount: number;
  }>(
    [
      "dataSourceVersionList",
      paginationModel.page,
      paginationModel.pageSize,
      dataSourceId,
    ],
    GET?.Data_Source_Version +
      `/list?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}` +
      (dataSourceId ? `&dataSourceId=${dataSourceId}` : ""),
    true
  );

  const [expandedMappingRows, setExpandedMappingRows] = useState<any>({});
  const [expandedSepratorRows, setExpandedSepratorRows] = useState<any>({});

  const toggleMappingRow = (index: number) => {
    setExpandedMappingRows((prev: any) => ({
      ...prev,
      [index]: !prev[index],
    }));
    setExpandedSepratorRows((prev: any) => ({ ...prev, [index]: false }));
  };

  const toggleSepratorRow = (index: number) => {
    setExpandedMappingRows((prev: any) => ({ ...prev, [index]: false }));
    setExpandedSepratorRows((prev: any) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // ✅ FIX: Reset page when pageSize changes
  useEffect(() => {
    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));
  }, [paginationModel.pageSize]);

  // ✅ FIX: Handle API response + prevent empty page issue
  useEffect(() => {
    if (dataSourceVersionList?.data?.data) {
      const apiData = dataSourceVersionList.data.data;

      setDataSourceVersion(apiData);

      const hasProcessing = apiData.some(
        (item: any) => item.status === "processing"
      );
      setHasProcessingItems(hasProcessing);

      // ✅ Prevent blank page when deleting / last page overflow
      if (
        apiData.length === 0 &&
        paginationModel.page > 0 &&
        dataSourceVersionList?.data?.totalCount > 0
      ) {
        setPaginationModel((prev) => ({
          ...prev,
          page: prev.page - 1,
        }));
      }
    }
  }, [dataSourceVersionList?.data]);

  useEffect(() => {
    if (reload) {
      dataSourceVersionList.refetch();
      setReload(false);
    }
  }, [reload]);

  useEffect(() => {
    let interval: any;

    if (hasProcessingItems) {
      interval = setInterval(() => {
        dataSourceVersionList.refetch();
      }, 8000);
    }

    return () => clearInterval(interval);
  }, [hasProcessingItems]);

  const renderMappings = (mappings: any) => (
    <Box sx={{ m: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell>SETTING ATTRIBUTES</StyledTableCell>
            <StyledTableCell>MAPPED FILE ATTRIBUTES</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(mappings).map(([k, v]: any, i) => (
            <StyledTableRow key={i}>
              <StyledTableCell>{k || "-"}</StyledTableCell>
              <StyledTableCell>
                {Array.isArray(v) ? v.join(", ") : v || "-"}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  const renderSeparators = (separators: any) => (
    <Box sx={{ m: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell>SETTING ATTRIBUTES</StyledTableCell>
            <StyledTableCell>SEPARATOR</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(separators).map(([k, v]: any, i) => (
            <StyledTableRow key={i}>
              <StyledTableCell>{k || "-"}</StyledTableCell>
              <StyledTableCell>{v || "-"}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  if (!dataSourceVersionList.isFetching && !dataSourceVersion.length) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography sx={getHeadingSx()}>
          No data source version found.
        </Typography>
      </Box>
    );
  }

  const columns = [
    {
      id: "dataSourceName",
      label: "Data Source Name",
      renderCell: (row: any) => row?.dataSourceId?.name || "-",
    },
    {
      id: "vendorName",
      label: "Vendor",
      renderCell: (row: any) => row?.vendorId?.name || "-",
    },
    { id: "versionValue", label: "Period" },
    { id: "fileName", label: "File Name" },
    // {
    //   id: "mappings",
    //   label: "Mappings",
    //   renderCell: (row: any, index: number) =>
    //     row.mappings ? (
    //       <IconButton onClick={() => toggleMappingRow(index)}>
    //         {expandedMappingRows[index] ? (
    //           <KeyboardArrowUpIcon />
    //         ) : (
    //           <KeyboardArrowDownIcon />
    //         )}
    //       </IconButton>
    //     ) : (
    //       "-"
    //     ),
    // },
    {
      id: "createdBy",
      label: "Created By",
      renderCell: (row: any) =>
        row.createdBy
          ? `${row.createdBy.firstName} ${row.createdBy.lastName}`
          : "-",
    },
    {
      id: "createdAt",
      label: "Created At",
      renderCell: (row: any) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleString()
          : "-",
    },
    // { id: "versionName", label: "Version ID" },
    {
      id: "status",
      label: "Status",
      renderCell: (row: any) =>
        row.status ? <StatusChip status={row.status} /> : "-",
    },
    {
      id: "error",
      label: "Error",
      renderCell: (row: any) =>
        row.status === "failed" ? (
          <ErrorDialog dataSourceVersionId={row._id} />
        ) : (
          "-"
        ),
    },
  ];

  return (
    <PageCardLayout>
      <CommonTable
        columns={columns}
        rows={dataSourceVersion}
        loading={false}
        isLazyLoading={dataSourceVersionList.isFetching}
        height="calc(100vh - 200px)"

       page={paginationModel.page}
rowsPerPage={paginationModel.pageSize}
totalCount={dataSourceVersionList?.data?.totalCount ?? 0}

onPageChange={(newPage: number) => {
  setPaginationModel((prev) => ({
    ...prev,
    page: newPage,
  }));
}}

onRowsPerPageChange={(newPageSize: number) => {
  setPaginationModel({
    page: 0, // IMPORTANT RESET
    pageSize: newPageSize,
  });
}}

        collpasible={(row: any, index: number) => (
          <>
            {row.mappings && (
              <StyledTableRow>
                <TableCell colSpan={10}>
                  <Collapse in={expandedMappingRows[index]}>
                    {renderMappings(row.mappings)}
                  </Collapse>
                </TableCell>
              </StyledTableRow>
            )}

            {row.separator &&
              Object.keys(row.separator).length > 0 && (
                <StyledTableRow>
                  <TableCell colSpan={10}>
                    <Collapse in={expandedSepratorRows[index]}>
                      {renderSeparators(row.separator)}
                    </Collapse>
                  </TableCell>
                </StyledTableRow>
              )}
          </>
        )}
      />
    </PageCardLayout>
  );
};

export default DataSourceVersionTable;