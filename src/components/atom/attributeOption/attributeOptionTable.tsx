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
  Collapse,
  Box,
  IconButton,
  Button,
  // Switch,
  Skeleton,
  Typography,
  tableCellClasses,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import useGet from "../../../hooks/useGet";
import { GET } from "../../../services/apiRoutes";
import { AttributeOptionRequestPayload } from "./types";
import CreateUpdateAttributeOption from "./createUpdateAttributeOption";
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
  attributeOptionReload: boolean; // attributeOptionReload is now a boolean
  setAttributeOptionReload: React.Dispatch<React.SetStateAction<boolean>>;
  shouldAllowEdit: boolean;
}

const AttributeOptionTable: React.FC<AttributeOptionTableProps> = ({
  attributeOptionReload,
  setAttributeOptionReload,
  shouldAllowEdit,
}) => {
  const { getTableSx } = useComponentTypography();
  const [attributes, setAttributes] = useState<AttributeOptionRequestPayload[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const toggleRow = (index: number): void => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const perPageItem = 10;
  const attributeList = useGet<{
    success: boolean;
    data: AttributeOptionRequestPayload[];
    totalCount: number;
  }>(
    [`attributeList`, String(currentPage)],
    GET?.Attribute_Option_List + `?page=${currentPage}&limit=${perPageItem}`,
    !!currentPage
  );

  // Handle reload - reset to page 1 and clear existing data
  useEffect(() => {
    if (attributeOptionReload) {
      setAttributes([]);
      setCurrentPage(1);
      setIsInitialized(false);
    }
  }, [attributeOptionReload]);

  // Handle data fetching when page changes
  useEffect(() => {
    if (attributeOptionReload && currentPage === 1) {
      attributeList.refetch();
      setAttributeOptionReload(false);
      setIsInitialized(true);
    } else if (isInitialized && currentPage > 1) {
      attributeList.refetch();
    }
  }, [currentPage, attributeOptionReload, isInitialized]);

  // Update attributes when new data is fetched
  useEffect(() => {
    if (attributeList?.data?.data) {
      if (currentPage === 1) {
        setAttributes([...attributeList?.data?.data]);
      } else {
        setAttributes((prev) => [...prev, ...attributeList?.data?.data]);
      }
    }
  }, [attributeList?.data?.data]);

  const lastRowRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (
        attributeList.isFetching ||
        attributes.length >= (attributeList?.data?.totalCount || 0)
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
    [
      attributeList.isFetching,
      attributes.length,
      attributeList?.data?.totalCount,
    ]
  );

  const renderAttributes = (attributes: string[] = []): JSX.Element => (
    <Box sx={{ margin: STYLE_GUIDE.SPACING.s2 }}>
      <Table size="small" aria-label="attributes">
        <TableHead>
          <TableRow>
            <StyledTableCell>ATTRIBUTE OPTIONS</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attributes.map((attr, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{attr || "-"}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  if (!attributeList.isFetching && !attributes.length && !isInitialized) {
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
            fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
            color: STYLE_GUIDE.COLORS.textDarkGray,
            fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily.primary,
            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxl,
          }}
          gutterBottom
        >
          No attributes option have been created yet. Please create an an
          attribute option to display it here.
        </Typography>
      </Box>
    );
  }

  const columns = [
    {
      id: "attributeName",
      label: "Name",
      minWidth: 170,
    },
    {
      id: "attributeValue",
      label: "Attribute Option",
      minWidth: 170,
      renderCell: (row: Record<string, unknown>, index?: number) => {
        return row.attributeValue?.length ? (
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => toggleRow(index)}
          >
            {expandedRows[index] ? (
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
      minWidth: 170,
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
      renderCell: (row: Record<string, unknown>) => {
        return row.updatedBy
          ? `${row.updatedBy?.firstName} ${row.updatedBy?.lastName}`
          : "-";
      },
    },
    {
      id: "createdAt",
      label: "Created At",
      minWidth: 230,
      renderCell: (row: Record<string, unknown>) => {
        return row.createdAt ? formatDate(row.createdAt) : "-";
      },
    },
    {
      id: "updatedAt",
      label: "Updated At",
      minWidth: 230,
      renderCell: (row: Record<string, unknown>) => {
        return row.updatedAt ? formatDate(row.updatedAt) : "-";
      },
    },
    {
      id: "status",
      label: "Status",
      minWidth: 170,
      renderCell: (row: Record<string, unknown>) => {
        return row.isActive ? (
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
        );
      },
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 170,
      renderCell: (row: Record<string, unknown>) => {
        return (
          <CreateUpdateAttributeOption
            setAttributeOptionReload={setAttributeOptionReload}
            title="Update Attribute Option"
            CustomButton={<Button disabled={!shouldAllowEdit}>Edit</Button>}
            data={row}
          />
        );
      },
    },
  ];

  return (
    <CommonTable
      columns={columns}
      rows={attributes || []}
      loading={false}
      isLazyLoading={attributeList.isFetching}
      height="calc(100vh - 200px)"
      isLazyTable={true}
      lastElementRef={lastElementRef}
      collpasible={(row, index) => {
        return (
          row &&
          row.attributeValue &&
          row.attributeValue?.length > 0 && (
            <StyledTableRow>
              <TableCell
                style={{ paddingBottom: 0, paddingTop: 0 }}
                colSpan={9}
              >
                <Collapse in={expandedRows[index]} timeout="auto" unmountOnExit>
                  {renderAttributes(row.attributeValue)}
                </Collapse>
              </TableCell>
            </StyledTableRow>
          )
        );
      }}
    />
  );

  return (
    <TableContainer component={Paper} sx={{ ...getTableSx() }}>
      <Table sx={{ width: "100%" }} aria-label="attribute-option-table">
        <TableHead>
          <TableRow>
            <StyledTableCell>NAME</StyledTableCell>
            <StyledTableCell>ATTRIBUTE OPTION</StyledTableCell>
            <StyledTableCell>CREATED BY</StyledTableCell>
            <StyledTableCell>UPDATED BY</StyledTableCell>
            <StyledTableCell>CREATED AT</StyledTableCell>
            <StyledTableCell>UPDATED AT</StyledTableCell>
            <StyledTableCell>STATUS</StyledTableCell>
            <StyledTableCell>ACTION</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attributes.map((data, dataIndex) => (
            <React.Fragment key={data._id}>
              <StyledTableRow
                ref={
                  attributes.length === dataIndex + 1 ? lastElementRef : null
                }
              >
                <StyledTableCell>{data.attributeName || "-"}</StyledTableCell>
                <StyledTableCell>
                  {data.attributeValue?.length ? (
                    <IconButton
                      aria-label="expand row"
                      size="small"
                      onClick={() => toggleRow(dataIndex)}
                    >
                      {expandedRows[dataIndex] ? (
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
                  {data.updatedBy && data.updatedAt
                    ? new Date(data.updatedAt).toLocaleString()
                    : "-"}
                </StyledTableCell>
                <StyledTableCell>
                  {/* <Switch checked={data.isActive} /> */}
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
                <StyledTableCell title="Edit Attribute Option">
                  <CreateUpdateAttributeOption
                    setAttributeOptionReload={setAttributeOptionReload}
                    title="Update Attribute Option"
                    CustomButton={<Button>Edit</Button>}
                    data={data}
                  />
                </StyledTableCell>
              </StyledTableRow>
              {data &&
                data.attributeValue &&
                data.attributeValue?.length > 0 && (
                  <StyledTableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={9}
                    >
                      <Collapse
                        in={expandedRows[dataIndex]}
                        timeout="auto"
                        unmountOnExit
                      >
                        {renderAttributes(data.attributeValue)}
                      </Collapse>
                    </TableCell>
                  </StyledTableRow>
                )}
            </React.Fragment>
          ))}
          {attributeList.isFetching &&
            Array.from({ length: 1 }, (_, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell colSpan={9}>
                  <Skeleton height={40} />
                </StyledTableCell>
              </StyledTableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AttributeOptionTable;
