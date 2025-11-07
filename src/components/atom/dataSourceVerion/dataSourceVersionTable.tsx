// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { styled } from '@mui/material/styles';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Box,
//   Skeleton,
//   Typography,
//   tableCellClasses,
//   Collapse,
//   IconButton,
// } from '@mui/material';

// import useGet from '../../../hooks/useGet';
// import { GET } from '../../../services/apiRoutes';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// import ErrorDialog from './showError';
// import { STYLE_GUIDE } from '../../../styles';
// import { useComponentTypography } from '../../../hooks/useComponentTypography';

// const StyledTableCell = styled(TableCell)(({ theme }) => ({
//   [`&.${tableCellClasses.head}`]: {
//     backgroundColor: theme.palette.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
//     color: theme.palette.table?.headerText || STYLE_GUIDE.COLORS.textGray,
//     fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
//   },
//   [`&.${tableCellClasses.body}`]: {
//    fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
//    color: theme.palette.table?.rowText || STYLE_GUIDE.COLORS.textDarkGray,
//   },
// }));

// const StyledTableRow = styled(TableRow)(({ theme }) => ({
//   "&:nth-of-type(odd)": {
//     backgroundColor: theme.palette.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault,
//   },
//   "&:nth-of-type(even)": {
//     backgroundColor: theme.palette.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white,
//   },
//   "&:hover": {
//     backgroundColor: theme.palette.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover,
//   },
// }));

// interface AttributeOptionTableProps {
//   reload: boolean; // reload is now a boolean
//   setReload: React.Dispatch<React.SetStateAction<boolean>>;
// }

// const DataSourceVersionTable: React.FC<AttributeOptionTableProps> = ({ reload, setReload }) => {
//   const { getHeadingSx, getTableSx } = useComponentTypography();
//   const [dataSourceVersion, setDataSourceVersion] = useState<any[]>([]);
//   const [currentPage, setCurrentPage] = useState<number>(1);

//   const perPageItem = 10;

//   const dataSourceVersionList = useGet<{ success: boolean; data: any[]; totalCount: number }>(
//     [`dataSourceVersionList`, String(currentPage)],
//     GET?.Data_Source_Version + `/list?page=${currentPage}&limit=${perPageItem}`,
//     !!currentPage
//   );

//   const [expandedMappingRows, setExpandedMappingRows] = useState<{ [key: number]: boolean }>({});
//   const [expandedSepratorRows, setExpandedSepratorRows] = useState<{ [key: number]: boolean }>({});

//   const toggleMappingRow = (index: number): void => {
//     setExpandedMappingRows((prev) => ({ ...prev, [index]: !prev[index] }));
//     setExpandedSepratorRows((prev) => ({ ...prev, [index]: false }));
//   };

//   const toggleSepratorRow = (index: number): void => {
//     setExpandedMappingRows((prev) => ({ ...prev, [index]: false }));
//     setExpandedSepratorRows((prev) => ({ ...prev, [index]: !prev[index] }));
//   };

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [reload]);

//   useEffect(() => {
//     if (currentPage === 1 && reload) {
//       dataSourceVersionList.refetch();
//       setReload(false);
//     }
//   }, [currentPage, reload]);

//   useEffect(() => {
//     if (dataSourceVersionList?.data?.data) {
//       if (currentPage === 1) {
//         setDataSourceVersion([...dataSourceVersionList?.data?.data]);
//       } else {
//         setDataSourceVersion((prev) => [...prev, ...dataSourceVersionList?.data?.data]);
//       }
//     }
//   }, [dataSourceVersionList?.data?.data]);

//   useEffect(() => {
//     setCurrentPage(currentPage);
//   }, [currentPage]);

//   const lastRowRef = useRef<IntersectionObserver | null>(null);

//   const lastElementRef = useCallback(
//     (node: HTMLTableRowElement | null) => {
//       if (dataSourceVersionList.isFetching || dataSourceVersion.length >= dataSourceVersionList?.data?.totalCount!)
//         return;

//       // Disconnect the previous observer if it exists
//       if (lastRowRef.current) {
//         lastRowRef.current.disconnect();
//       }

//       // Create a new IntersectionObserver
//       lastRowRef.current = new IntersectionObserver((entries) => {
//         if (entries[0].isIntersecting) {
//           setCurrentPage((prevPage) => prevPage + 1);
//         }
//       });

//       // Observe the new node if it exists
//       if (node) {
//         lastRowRef.current.observe(node);
//       }
//     },
//     [dataSourceVersionList.isFetching] // Add the correct dependency
//   );

//   const renderMappings = (mappings: Record<string, string>): JSX.Element => (
//     <Box sx={{ margin: 1 }}>
//       <Table size="small" aria-label="attributes">
//         <TableHead>
//           <TableRow>
//             <StyledTableCell>SETTING ATTRIBUTES</StyledTableCell>
//             <StyledTableCell>MAPPED FILE ATTRIBUTES</StyledTableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {Object.entries(mappings).map(([key, value], index) => (
//             <StyledTableRow key={index}>
//               <StyledTableCell>{key || '-'}</StyledTableCell>
//               <StyledTableCell>{value || '-'}</StyledTableCell>
//             </StyledTableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </Box>
//   );

//   const renderSeparators = (separators: Record<string, string>): JSX.Element => (
//     <Box sx={{ margin: 1 }}>
//       <Table size="small" aria-label="attributes">
//         <TableHead>
//           <TableRow>
//             <StyledTableCell>SETTING ATTRIBUTES</StyledTableCell>
//             <StyledTableCell>SEPARATOR</StyledTableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {Object.entries(separators).map(([key, value], index) => (
//             <StyledTableRow key={index}>
//               <StyledTableCell>{key || '-'}</StyledTableCell>
//               <StyledTableCell>{value || '-'}</StyledTableCell>
//             </StyledTableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </Box>
//   );

//   if (!dataSourceVersionList.isFetching && !dataSourceVersion.length) {
//     return (
//       <Box
//         display="flex"
//         flexDirection="column"
//         sx={{ textAlign: 'center', marginTop: 10 }}
//         alignContent="center"
//         alignItems="center"
//       >
//         <Typography
//           variant="h4"
//           sx={{
//             ...getHeadingSx(),
//             fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
//             color: STYLE_GUIDE.COLORS.textDarkGray,
//             fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxl,
//           }}
//         >
//           No data source version have been created yet. Please create a data source version to display it here.
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <TableContainer component={Paper} sx={{ ...getTableSx() }}>
//       <Table sx={{ width: '100%' }} aria-label="attribute-option-table">
//         <TableHead>
//           <TableRow>
//             <StyledTableCell>VERSION NAME</StyledTableCell>
//             <StyledTableCell>PERIOD</StyledTableCell>
//             <StyledTableCell>DATA SOURCE NAME</StyledTableCell>
//             <StyledTableCell>FILE NAME</StyledTableCell>
//             <StyledTableCell>MAPPINGS</StyledTableCell>
//             <StyledTableCell>SEPARATOR</StyledTableCell>
//             <StyledTableCell>CREATED BY</StyledTableCell>
//             <StyledTableCell>CREATED AT</StyledTableCell>
//             <StyledTableCell>STATUS</StyledTableCell>
//             <StyledTableCell>ERROR</StyledTableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {dataSourceVersion.map((data, dataIndex) => (
//             <React.Fragment key={data._id}>
//               <StyledTableRow ref={dataSourceVersion.length === dataIndex + 1 ? lastElementRef : null}>
//                 <StyledTableCell>{data.versionName || '-'}</StyledTableCell>
//                 <StyledTableCell>{data.versionValue || '-'}</StyledTableCell>
//                 <StyledTableCell>{data?.dataSourceId?.name || '-'}</StyledTableCell>
//                 <StyledTableCell>{data.fileName || '-'}</StyledTableCell>
//                 <StyledTableCell>
//                   {data.mappings ? (
//                     <IconButton aria-label="expand row" size="small" onClick={() => toggleMappingRow(dataIndex)}>
//                       {expandedMappingRows[dataIndex] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
//                     </IconButton>
//                   ) : (
//                     '-'
//                   )}
//                 </StyledTableCell>

//                 <StyledTableCell>
//                   {data.separator && Object.keys(data.separator).length > 0 ? (
//                     <IconButton aria-label="expand row" size="small" onClick={() => toggleSepratorRow(dataIndex)}>
//                       {expandedSepratorRows[dataIndex] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
//                     </IconButton>
//                   ) : (
//                     '-'
//                   )}
//                 </StyledTableCell>

//                 <StyledTableCell>
//                   {data.createdBy ? `${data.createdBy.firstName} ${data.createdBy.lastName}` : '-'}
//                 </StyledTableCell>

//                 <StyledTableCell>{data.createdAt ? new Date(data.createdAt).toLocaleString() : '-'}</StyledTableCell>

//                 <StyledTableCell>{data.status || '-'}</StyledTableCell>

//                 <StyledTableCell>
//                   {data.status === 'failed' ? <ErrorDialog dataSourceVersionId={data._id} /> : '-'}
//                 </StyledTableCell>
//               </StyledTableRow>
//               {data && data.mappings && (
//                 <StyledTableRow>
//                   <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
//                     <Collapse in={expandedMappingRows[dataIndex]} timeout="auto" unmountOnExit>
//                       {renderMappings(data.mappings)}
//                     </Collapse>
//                   </TableCell>
//                 </StyledTableRow>
//               )}

//               {data && data.separator && Object.keys(data.separator).length > 0 && (
//                 <StyledTableRow>
//                   <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
//                     <Collapse in={expandedSepratorRows[dataIndex]} timeout="auto" unmountOnExit>
//                       {renderSeparators(data.separator)}
//                     </Collapse>
//                   </TableCell>
//                 </StyledTableRow>
//               )}
//             </React.Fragment>
//           ))}

//           {dataSourceVersionList.isFetching &&
//             Array.from({ length: 1 }, (_, index) => (
//               <StyledTableRow key={index}>
//                 <StyledTableCell colSpan={10}>
//                   <Skeleton height={40} />
//                 </StyledTableCell>
//             </StyledTableRow>
//             ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// };

// export default DataSourceVersionTable;

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
  Skeleton,
  Typography,
  tableCellClasses,
  Collapse,
  IconButton,
} from "@mui/material";

import useGet from "../../../hooks/useGet";
import { GET } from "../../../services/apiRoutes";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ErrorDialog from "./showError";
import { STYLE_GUIDE } from "../../../styles";
import { useComponentTypography } from "../../../hooks/useComponentTypography";
import CommonTable from "../../common/table";

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
  "&:hover": {
    backgroundColor:
      theme.palette.table?.rowHoverBackground ||
      STYLE_GUIDE.COLORS.backgroundHover,
  },
}));

interface AttributeOptionTableProps {
  reload: boolean;
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataSourceVersionTable: React.FC<AttributeOptionTableProps> = ({
  reload,
  setReload,
}) => {
  const { getHeadingSx, getTableSx } = useComponentTypography();
  const [dataSourceVersion, setDataSourceVersion] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasProcessingItems, setHasProcessingItems] = useState<boolean>(false);

  const perPageItem = 10;

  const dataSourceVersionList = useGet<{
    success: boolean;
    data: any[];
    totalCount: number;
  }>(
    [`dataSourceVersionList`, String(currentPage)],
    GET?.Data_Source_Version + `/list?page=${currentPage}&limit=${perPageItem}`,
    !!currentPage
  );

  const [expandedMappingRows, setExpandedMappingRows] = useState<{
    [key: number]: boolean;
  }>({});
  const [expandedSepratorRows, setExpandedSepratorRows] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleMappingRow = (index: number): void => {
    setExpandedMappingRows((prev) => ({ ...prev, [index]: !prev[index] }));
    setExpandedSepratorRows((prev) => ({ ...prev, [index]: false }));
  };

  const toggleSepratorRow = (index: number): void => {
    setExpandedMappingRows((prev) => ({ ...prev, [index]: false }));
    setExpandedSepratorRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [reload]);

  useEffect(() => {
    if (currentPage === 1 && reload) {
      dataSourceVersionList.refetch();
      setReload(false);
    }
  }, [currentPage, reload]);

  useEffect(() => {
    if (dataSourceVersionList?.data?.data) {
      if (currentPage === 1) {
        setDataSourceVersion([...dataSourceVersionList?.data?.data]);
      } else {
        setDataSourceVersion((prev) => [
          ...prev,
          ...dataSourceVersionList?.data?.data,
        ]);
      }

      // Check if there are any items with 'process' status
      const hasProcessing = dataSourceVersionList?.data?.data.some(
        (item: any) => item.status === "processing"
      );
      setHasProcessingItems(hasProcessing);
    }
  }, [dataSourceVersionList?.data?.data]);

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage]);

  // Auto-refresh when there are processing items
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (hasProcessingItems) {
      // Poll every 8 seconds when there are items being processed
      intervalId = setInterval(() => {
        dataSourceVersionList.refetch();
      }, 8000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [hasProcessingItems, dataSourceVersionList]);

  const lastRowRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (
        dataSourceVersionList.isFetching ||
        dataSourceVersion.length >= dataSourceVersionList?.data?.totalCount!
      )
        return;

      // Disconnect the previous observer if it exists
      if (lastRowRef.current) {
        lastRowRef.current.disconnect();
      }

      // Create a new IntersectionObserver
      lastRowRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });

      // Observe the new node if it exists
      if (node) {
        lastRowRef.current.observe(node);
      }
    },
    [dataSourceVersionList.isFetching]
  );

  const renderMappings = (mappings: Record<string, string>): JSX.Element => (
    <Box sx={{ margin: 1 }}>
      <Table size="small" aria-label="attributes">
        <TableHead>
          <TableRow>
            <StyledTableCell>SETTING ATTRIBUTES</StyledTableCell>
            <StyledTableCell>MAPPED FILE ATTRIBUTES</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(mappings).map(([key, value], index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{key || "-"}</StyledTableCell>
              <StyledTableCell>{value || "-"}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  const renderSeparators = (
    separators: Record<string, string>
  ): JSX.Element => (
    <Box sx={{ margin: 1 }}>
      <Table size="small" aria-label="attributes">
        <TableHead>
          <TableRow>
            <StyledTableCell>SETTING ATTRIBUTES</StyledTableCell>
            <StyledTableCell>SEPARATOR</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(separators).map(([key, value], index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{key || "-"}</StyledTableCell>
              <StyledTableCell>{value || "-"}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  if (!dataSourceVersionList.isFetching && !dataSourceVersion.length) {
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
        >
          No data source version have been created yet. Please create a data
          source version to display it here.
        </Typography>
      </Box>
    );
  }

  const columns = [
    { id: "versionName", label: "Version Name", minWidth: 170 },
    { id: "versionValue", label: "Period", minWidth: 170 },
    {
      id: "dataSourceName",
      label: "Data Source Name",
      minWidth: 250,
      renderCell: (row: Record<string, unknown>) => {
        return row.dataSourceId?.name || "-";
      },
    },
    {
      id: "dataSourceName",
      label: "Data Source Name",
      minWidth: 250,
      renderCell: (row: Record<string, unknown>) => {
        return row.fileName || "-";
      },
    },
    { id: "fileName", label: "File Name" },
    {
      id: "mappings",
      label: "Mappings",
      renderCell: (row: Record<string, unknown>, index: number) => {
        return row.mappings ? (
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => toggleMappingRow(index)}
          >
            {expandedMappingRows[index] ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        ) : (
          "-"
        );
      },
    },
    {
      id: "separator",
      label: "Separator",
      renderCell: (row: Record<string, unknown>, index: number) => {
        return row.separator && Object.keys(row.separator).length > 0 ? (
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => toggleSepratorRow(index)}
          >
            {expandedSepratorRows[index] ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        ) : (
          "-"
        );
      },
    },
    {
      id: "createdBy",
      label: "Created By",
      minWidth: 200,
      renderCell: (row: Record<string, unknown>) => {
        return row.createdBy ? (
          <Typography variant="body2" color="text.secondary">
            {row.createdBy.firstName} {row.createdBy.lastName}
          </Typography>
        ) : (
          "-"
        );
      },
    },
    {
      id: "createdAt",
      label: "Created At",
      minWidth: 200,
      renderCell: (row: Record<string, unknown>) => {
        return row.createdAt ? new Date(row.createdAt).toLocaleString() : "-";
      },
    },
    {
      id: "status",
      label: "Status",
      minWidth: 170,
      renderCell: (row: Record<string, unknown>) => {
        return row.status ? (
          <Typography variant="body2" color="text.secondary">
            {row.status}
          </Typography>
        ) : (
          "-"
        );
      },
    },
    {
      id: "error",
      label: "Error",
      minWidth: 170,
      renderCell: (row: Record<string, unknown>) => {
        return row.status === "failed" ? (
          <ErrorDialog dataSourceVersionId={row._id} />
        ) : (
          "-"
        );
      },
    },
  ];

  return (
    <CommonTable
      columns={columns}
      isLazyLoading={dataSourceVersionList.isFetching}
      rows={dataSourceVersion || []}
      height="calc(100vh - 200px)"
      isLazyTable={true}
      collpasible={(row, index) => {
        return (
          <>
            {row.mappings && (
              <StyledTableRow>
                <TableCell
                  style={{ paddingBottom: 0, paddingTop: 0 }}
                  colSpan={9}
                >
                  <Collapse
                    in={expandedMappingRows[index]}
                    timeout="auto"
                    unmountOnExit
                  >
                    {renderMappings(row.mappings)}
                  </Collapse>
                </TableCell>
              </StyledTableRow>
            )}

            {row.separator &&
              row.separator &&
              Object.keys(row.separator).length > 0 && (
                <StyledTableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={10}
                  >
                    <Collapse
                      in={expandedSepratorRows[index]}
                      timeout="auto"
                      unmountOnExit
                    >
                      {renderSeparators(row.separator)}
                    </Collapse>
                  </TableCell>
                </StyledTableRow>
              )}
          </>
        );
      }}
      ref={lastElementRef}
    />
  );

  return (
    <TableContainer component={Paper} sx={{ ...getTableSx() }}>
      <Table sx={{ width: "100%" }} aria-label="attribute-option-table">
        <TableHead>
          <TableRow>
            <StyledTableCell>VERSION NAME</StyledTableCell>
            <StyledTableCell>PERIOD</StyledTableCell>
            <StyledTableCell>DATA SOURCE NAME</StyledTableCell>
            <StyledTableCell>FILE NAME</StyledTableCell>
            <StyledTableCell>MAPPINGS</StyledTableCell>
            <StyledTableCell>SEPARATOR</StyledTableCell>
            <StyledTableCell>CREATED BY</StyledTableCell>
            <StyledTableCell>CREATED AT</StyledTableCell>
            <StyledTableCell>STATUS</StyledTableCell>
            <StyledTableCell>ERROR</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataSourceVersion.map((data, dataIndex) => (
            <React.Fragment key={data._id}>
              <StyledTableRow
                ref={
                  dataSourceVersion.length === dataIndex + 1
                    ? lastElementRef
                    : null
                }
              >
                <StyledTableCell>{data.versionName || "-"}</StyledTableCell>
                <StyledTableCell>{data.versionValue || "-"}</StyledTableCell>
                <StyledTableCell>
                  {data?.dataSourceId?.name || "-"}
                </StyledTableCell>
                <StyledTableCell>{data.fileName || "-"}</StyledTableCell>
                <StyledTableCell>
                  {data.mappings ? (
                    <IconButton
                      aria-label="expand row"
                      size="small"
                      onClick={() => toggleMappingRow(dataIndex)}
                    >
                      {expandedMappingRows[dataIndex] ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  ) : (
                    "-"
                  )}
                </StyledTableCell>

                <StyledTableCell>
                  {data.separator && Object.keys(data.separator).length > 0 ? (
                    <IconButton
                      aria-label="expand row"
                      size="small"
                      onClick={() => toggleSepratorRow(dataIndex)}
                    >
                      {expandedSepratorRows[dataIndex] ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  ) : (
                    "-"
                  )}
                </StyledTableCell>

                <StyledTableCell>
                  {data.createdBy
                    ? `${data.createdBy.firstName} ${data.createdBy.lastName}`
                    : "-"}
                </StyledTableCell>

                <StyledTableCell>
                  {data.createdAt
                    ? new Date(data.createdAt).toLocaleString()
                    : "-"}
                </StyledTableCell>

                <StyledTableCell>{data.status || "-"}</StyledTableCell>

                <StyledTableCell>
                  {data.status === "failed" ? (
                    <ErrorDialog dataSourceVersionId={data._id} />
                  ) : (
                    "-"
                  )}
                </StyledTableCell>
              </StyledTableRow>
              {data && data.mappings && (
                <StyledTableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={9}
                  >
                    <Collapse
                      in={expandedMappingRows[dataIndex]}
                      timeout="auto"
                      unmountOnExit
                    >
                      {renderMappings(data.mappings)}
                    </Collapse>
                  </TableCell>
                </StyledTableRow>
              )}

              {data &&
                data.separator &&
                Object.keys(data.separator).length > 0 && (
                  <StyledTableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={10}
                    >
                      <Collapse
                        in={expandedSepratorRows[dataIndex]}
                        timeout="auto"
                        unmountOnExit
                      >
                        {renderSeparators(data.separator)}
                      </Collapse>
                    </TableCell>
                  </StyledTableRow>
                )}
            </React.Fragment>
          ))}

          {dataSourceVersionList.isFetching &&
            Array.from({ length: 1 }, (_, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell colSpan={10}>
                  <Skeleton height={40} />
                </StyledTableCell>
              </StyledTableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataSourceVersionTable;
