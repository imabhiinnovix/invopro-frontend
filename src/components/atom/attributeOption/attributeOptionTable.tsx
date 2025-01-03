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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
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
    !!currentPage,
  );

  useEffect(() => {
    setCurrentPage(1); // This will trigger a state update
  }, [attributeOptionReload]);

  useEffect(() => {
    if (currentPage === 1 && attributeOptionReload) {
      setAttributes([]); // Clear attributes
      attributeList.refetch(); // Now safely refetch
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
    [attributeList.isFetching], // Add the correct dependency
  );

  const renderAttributes = (attributes: string[] = []): JSX.Element => (
    <Box sx={{ margin: 1 }}>
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
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          No attributes have been created yet. Please create an entity to display it here.
        </Typography>
        <Box maxWidth="600px">
          <CreateUpdateAttributeOption
            setAttributeOptionReload={setAttributeOptionReload}
            title="Create New Entity"
            CustomButton={
              <Button
                variant="contained"
                size="large"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  padding: '15px 30px',
                  bgcolor: '#007bff',
                  color: '#fff',
                  '&:hover': { bgcolor: '#0056b3' },
                  '@media (max-width: 600px)': {
                    fontSize: '1rem',
                    padding: '10px 20px',
                  },
                }}
              >
                Create New Entity
              </Button>
            }
          />
        </Box>
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
            <StyledTableCell>STATUS</StyledTableCell>
            <StyledTableCell>CREATED BY</StyledTableCell>
            <StyledTableCell>UPDATED BY</StyledTableCell>
            <StyledTableCell>CREATED AT</StyledTableCell>
            <StyledTableCell>UPDATED AT</StyledTableCell>
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
                  {/* <Switch checked={data.isActive} /> */}

                  {data.isActive ? (
                    <Typography color="success" fontSize={14} component="span">
                      ACTIVE
                    </Typography>
                  ) : (
                    <Typography color="error" fontSize={14} component="span">
                      INACTIVE
                    </Typography>
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
