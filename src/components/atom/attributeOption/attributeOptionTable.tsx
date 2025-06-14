import React, { useState, useEffect, useRef, useCallback } from 'react';
import { styled } from '@mui/material/styles';
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
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import useGet from '../../../hooks/useGet';
import { GET } from '../../../services/apiRoutes';
import { AttributeOptionRequestPayload } from './types';
import CreateUpdateAttributeOption from './createUpdateAttributeOption';
import { COLORS } from '../../../styles/color';
import { TYPOGRAPHY } from '../../../styles/typography';
import { SPACING } from '../../../styles/spacing';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
     fontSize: TYPOGRAPHY.fontSize.base,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
}));

interface AttributeOptionTableProps {
  attributeOptionReload: boolean; // attributeOptionReload is now a boolean
  setAttributeOptionReload: React.Dispatch<React.SetStateAction<boolean>>;
}

const AttributeOptionTable: React.FC<AttributeOptionTableProps> = ({
  attributeOptionReload,
  setAttributeOptionReload,
}) => {
  const [attributes, setAttributes] = useState<AttributeOptionRequestPayload[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});

  const toggleRow = (index: number): void => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const perPageItem = 10;

  const attributeList = useGet<{ success: boolean; data: AttributeOptionRequestPayload[]; totalCount: number }>(
    [`attributeList`, String(currentPage)],
    GET?.Attribute_Option_List + `?page=${currentPage}&limit=${perPageItem}`,
    !!currentPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [attributeOptionReload]);

  useEffect(() => {
    if (currentPage === 1 && attributeOptionReload) {
      attributeList.refetch();
      setAttributeOptionReload(false);
    }
  }, [currentPage, attributeOptionReload]);

  useEffect(() => {
    if (attributeList?.data?.data) {
      if (currentPage === 1) {
        setAttributes([...attributeList?.data?.data]);
      } else {
        setAttributes((prev) => [...prev, ...attributeList?.data?.data]);
      }
    }
  }, [attributeList?.data?.data]);

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage]);

  const lastRowRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (attributeList.isFetching || attributes.length >= attributeList?.data?.totalCount!) return;

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
    [attributeList.isFetching] // Add the correct dependency
  );

  const renderAttributes = (attributes: string[] = []): JSX.Element => (
    <Box sx={{ margin: SPACING.s2 }}>
      <Table size="small" aria-label="attributes">
        <TableHead>
          <TableRow>
            <StyledTableCell>ATTRIBUTE OPTIONS</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attributes.map((attr, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{attr || '-'}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  if (!attributeList.isFetching && !attributes.length) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        sx={{ textAlign: 'center', marginTop: 10 }}
        alignContent="center"
        alignItems="center"
      >
        <Typography 
          variant="h4" 
          sx={{
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.textDarkGray,
            fontFamily: TYPOGRAPHY.fontFamily.primary,
            fontSize: TYPOGRAPHY.fontSize.xxl,
          }}
          gutterBottom
        >
          No attributes option have been created yet. Please create an an attribute option to display it here.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ width: '100%' }} aria-label="attribute-option-table">
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
              <StyledTableRow ref={attributes.length === dataIndex + 1 ? lastElementRef : null}>
                <StyledTableCell>{data.attributeName || '-'}</StyledTableCell>
                <StyledTableCell>
                  {data.attributeValue?.length ? (
                    <IconButton aria-label="expand row" size="small" onClick={() => toggleRow(dataIndex)}>
                      {expandedRows[dataIndex] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  ) : (
                    '-'
                  )}
                </StyledTableCell>

                <StyledTableCell>
                  {data.createdBy ? `${data.createdBy.firstName} ${data.createdBy.lastName}` : '-'}
                </StyledTableCell>

                <StyledTableCell>
                  {data.updatedBy ? `${data.updatedBy.firstName} ${data.updatedBy.lastName}` : '-'}
                </StyledTableCell>

                <StyledTableCell>{data.createdAt ? new Date(data.createdAt).toLocaleString() : '-'}</StyledTableCell>

                <StyledTableCell>
                  {data.updatedBy && data.updatedAt ? new Date(data.updatedAt).toLocaleString() : '-'}
                </StyledTableCell>
                <StyledTableCell>
                  {/* <Switch checked={data.isActive} /> */}

                  {data.isActive ? (
                    <Typography 
                      sx={{
                        color: COLORS.bootstrapSuccess,
                        fontSize: TYPOGRAPHY.fontSize.small,
                      }}
                      component="span"
                    >
                      ACTIVE
                    </Typography>
                  ) : (
                    <Typography 
                      sx={{
                        color: COLORS.bootstrapDanger,
                        fontSize: TYPOGRAPHY.fontSize.small,
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

              {data && data.attributeValue && data.attributeValue?.length > 0 && (
                <StyledTableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                    <Collapse in={expandedRows[dataIndex]} timeout="auto" unmountOnExit>
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
