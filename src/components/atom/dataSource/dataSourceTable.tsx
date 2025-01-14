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
  Box,
  Button,
  Skeleton,
  Typography,
  tableCellClasses,
} from '@mui/material';

import useGet from '../../../hooks/useGet';
import { GET } from '../../../services/apiRoutes';
import { DataSourceType } from './types';
import CreateUpdateDataSource from './createUpdateDataSource';

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
  reload: boolean; // reload is now a boolean
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataSourceTable: React.FC<AttributeOptionTableProps> = ({ reload, setReload }) => {
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const perPageItem = 10;

  const dataSourceList = useGet<{ success: boolean; data: DataSourceType[]; totalCount: number }>(
    [`dataSourceList`, String(currentPage)],
    GET?.Data_Source_List + `?page=${currentPage}&limit=${perPageItem}`,
    !!currentPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [reload]);

  useEffect(() => {
    if (currentPage === 1 && reload) {
      dataSourceList.refetch();
      setReload(false);
    }
  }, [currentPage, reload]);

  useEffect(() => {
    if (dataSourceList?.data?.data) {
      if (currentPage === 1) {
        setDataSource([...dataSourceList?.data?.data]);
      } else {
        setDataSource((prev) => [...prev, ...dataSourceList?.data?.data]);
      }
    }
  }, [dataSourceList?.data?.data]);

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage]);

  const lastRowRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (dataSourceList.isFetching || dataSource.length >= dataSourceList?.data?.totalCount!) return;

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
    [dataSourceList.isFetching] // Add the correct dependency
  );

  if (!dataSourceList.isFetching && !dataSource.length) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        sx={{ textAlign: 'center', marginTop: 10 }}
        alignContent="center"
        alignItems="center"
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          No data source have been created yet. Please create a data source to display it here.
        </Typography>
        <Box maxWidth="600px">
          <CreateUpdateDataSource
            setReload={setReload}
            title="Create New Data Source"
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
                Create New Data Source
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
          {dataSource.map((data, dataIndex) => (
            <React.Fragment key={data._id}>
              <StyledTableRow ref={dataSource.length === dataIndex + 1 ? lastElementRef : null}>
                <StyledTableCell>{data.name || '-'}</StyledTableCell>
                <StyledTableCell>{data.code || '-'}</StyledTableCell>
                <StyledTableCell>{data.versionType || '-'}</StyledTableCell>
                <StyledTableCell>{data.entityId?.name! || '-'}</StyledTableCell>

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
                    <Typography color="success" fontSize={14} component="span">
                      ACTIVE
                    </Typography>
                  ) : (
                    <Typography color="error" fontSize={14} component="span">
                      INACTIVE
                    </Typography>
                  )}
                </StyledTableCell>
                <StyledTableCell title="Edit Attribute Option">
                  <CreateUpdateDataSource
                    setReload={setReload}
                    title="Update Attribute Option"
                    CustomButton={<Button>Edit</Button>}
                    data={data}
                  />
                </StyledTableCell>
              </StyledTableRow>
            </React.Fragment>
          ))}

          {dataSourceList.isFetching &&
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

export default DataSourceTable;
