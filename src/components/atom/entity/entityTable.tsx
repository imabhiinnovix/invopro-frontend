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
import CreateUpdateEntity from "./createUpdateEntity";
import { Attribute, EntityRequestPayload } from "./types";
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

interface EntityTableProps {
  reloadEntity: boolean; // reloadEntity is now a boolean
  setReloadEntity: React.Dispatch<React.SetStateAction<boolean>>;
  shouldAllowEdit: boolean;
  shouldAllowDelete: boolean;
}

const EntityTable: React.FC<EntityTableProps> = ({
  reloadEntity,
  setReloadEntity,
  shouldAllowEdit,
  shouldAllowDelete,
}) => {
  const { getHeadingSx, getTableSx } = useComponentTypography();
  const [entities, setEntities] = useState<EntityRequestPayload[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>(
    {}
  );

  const toggleRow = (index: number): void => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const perPageItem = 10;

  const entitiesList = useGet<{
    success: boolean;
    data: EntityRequestPayload[];
    totalCount: number;
  }>(
    [`entityList`, String(currentPage)],
    GET?.Entity_List + `?page=${currentPage}&limit=${perPageItem}`,
    !!currentPage
  );

  useEffect(() => {
    setCurrentPage(1); // This will trigger a state update
  }, [reloadEntity]);

  useEffect(() => {
    if (currentPage === 1 && reloadEntity) {
      entitiesList.refetch(); // Now safely refetch
      setReloadEntity(false);
    }
  }, [currentPage, reloadEntity]);

  useEffect(() => {
    if (entitiesList?.data?.data) {
      if (currentPage === 1) {
        setEntities([...entitiesList?.data?.data]);
      } else {
        setEntities((prev) => [...prev, ...entitiesList?.data?.data]);
      }
    }
  }, [entitiesList?.data?.data]);

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage]);

  const lastRowRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (
        entitiesList.isFetching ||
        entities.length >= entitiesList?.data?.totalCount!
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
    [entitiesList.isFetching] // Add the correct dependency
  );

  const renderAttributes = (attributes: Attribute[] = []): JSX.Element => (
    <Box sx={{ margin: 1 }}>
      <Table size="small" aria-label="attributes">
        <TableHead>
          <TableRow>
            <StyledTableCell>ATTRIBUTE NAME</StyledTableCell>
            <StyledTableCell>ATTRIBUTE TYPE</StyledTableCell>
            <StyledTableCell>ATTRIBUTE VALIDATION</StyledTableCell>
            <StyledTableCell>ATTRIBUTE TRANSFORMATIONS</StyledTableCell>
            <StyledTableCell>ATTRIBUTE CLEANER</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attributes.map((attr, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{attr.name || "-"}</StyledTableCell>
              <StyledTableCell>{attr.type || "-"}</StyledTableCell>
              <StyledTableCell>{attr.required}</StyledTableCell>
              <StyledTableCell>
                {attr.transformations?.length
                  ? attr.transformations.join(", ")
                  : "-"}
              </StyledTableCell>
              <StyledTableCell>
                {attr.cleaner?.length ? attr.cleaner.join(", ") : "-"}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  if (!entitiesList.isFetching && !entities.length) {
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
          No entities have been created yet. Please create an entity to display
          it here.
        </Typography>
      </Box>
    );
  }

  const columns = [
    { id: "name", label: "Name", minWidth: 170 },
    { id: "description", label: "Description", minWidth: 170 },
    {
      id: "attributes",
      label: "Attributes",
      minWidth: 170,
      renderCell: (row: Record<string, unknown>, index?: number) => {
        return row.attributes?.length ? (
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
      label: "Updat  ed By",
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
      minWidth: 200,
      renderCell: (row: Record<string, unknown>) => {
        return row.createdAt ? formatDate(row.createdAt) : "-";
      },
    },
    {
      id: "updatedAt",
      label: "Updated At",
      minWidth: 200,
      // { id: "createdAt", label: "Created At", minWidth: 170 },
      renderCell: (row: Record<string, unknown>) => {
        return row.updatedAt ? formatDate(row.updatedAt) : "-";
      },
    },
    {
      id: "status",
      label: "Status",
      minWidth: 170,
      renderCell: (row: Record<string, unknown>) => {
        return row.isActive ? "Active" : "Inactive";
      },
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 170,
      renderCell: (row: Record<string, unknown>) => {
        return (
          <CreateUpdateEntity
            setReloadEntity={setReloadEntity}
            title="Update Entity"
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
      rows={entities}
      loading={false}
      isLazyLoading={entitiesList.isFetching}
      height="calc(100vh - 200px)"
      isLazyTable={true}
      lastElementRef={lastElementRef}
      collpasible={(row, index) => {
        return (
          row &&
          row.attributes &&
          row.attributes?.length > 0 && (
            <StyledTableRow>
              <TableCell
                style={{ paddingBottom: 0, paddingTop: 0 }}
                colSpan={9}
              >
                <Collapse in={expandedRows[index]} timeout="auto" unmountOnExit>
                  {renderAttributes(row.attributes)}
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
      <Table sx={{ width: "100%" }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>NAME</StyledTableCell>
            <StyledTableCell>DESCRIPTION</StyledTableCell>
            <StyledTableCell>ATTRIBUTES</StyledTableCell>
            <StyledTableCell>CREATED BY</StyledTableCell>
            <StyledTableCell>UPDATED BY</StyledTableCell>
            <StyledTableCell>CREATED AT</StyledTableCell>
            <StyledTableCell>UPDATED AT</StyledTableCell>
            <StyledTableCell>STATUS</StyledTableCell>
            <StyledTableCell>ACTION</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entities.map((data, dataIndex) => (
            <React.Fragment key={data._id}>
              <StyledTableRow
                ref={entities.length === dataIndex + 1 ? lastElementRef : null}
              >
                <StyledTableCell>{data.name || "-"}</StyledTableCell>
                <StyledTableCell>{data.description || "-"}</StyledTableCell>
                <StyledTableCell>
                  {data.attributes?.length ? (
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
                      component="span"
                      sx={{
                        color: STYLE_GUIDE.COLORS.bootstrapSuccess,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                      }}
                    >
                      ACTIVE
                    </Typography>
                  ) : (
                    <Typography
                      component="span"
                      sx={{
                        color: STYLE_GUIDE.COLORS.bootstrapDanger,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.medium,
                      }}
                    >
                      INACTIVE
                    </Typography>
                  )}
                </StyledTableCell>
                <StyledTableCell title="Edit Entity">
                  <CreateUpdateEntity
                    setReloadEntity={setReloadEntity}
                    title="Update Entity"
                    CustomButton={<Button>Edit</Button>}
                    data={data}
                  />
                </StyledTableCell>
              </StyledTableRow>

              {data && data.attributes && data.attributes?.length > 0 && (
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
                      {renderAttributes(data.attributes)}
                    </Collapse>
                  </TableCell>
                </StyledTableRow>
              )}
            </React.Fragment>
          ))}

          {entitiesList.isFetching &&
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

export default EntityTable;
