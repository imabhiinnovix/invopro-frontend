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
import { STYLE_GUIDE } from '../../../styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.table?.headerBackground || STYLE_GUIDE.COLORS.backgroundLightGray,
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
    backgroundColor: theme.palette.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault,
  },
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white,
  },
  "&:hover": {
    backgroundColor: theme.palette.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover,
  },
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
        <Typography 
          variant="h4" 
          sx={{
            fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
            color: STYLE_GUIDE.COLORS.textDarkGray,
            fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxl,
          }}
          gutterBottom
        >
          No data source have been created yet. Please create a data source to display it here.
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
          {dataSource.map((data, dataIndex) => (
            <React.Fragment key={data._id}>
              <StyledTableRow ref={dataSource.length === dataIndex + 1 ? lastElementRef : null}>
                <StyledTableCell>{data.name || '-'}</StyledTableCell>
                <StyledTableCell>{data.description || '-'}</StyledTableCell>
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
