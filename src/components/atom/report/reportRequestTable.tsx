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
  Skeleton,
  Typography,
  tableCellClasses,
  Button,
} from '@mui/material';

import useGet from '../../../hooks/useGet';
import { GET } from '../../../services/apiRoutes';
import { ReportRequestResponse } from './types';

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

const ReportRequestTable: React.FC<AttributeOptionTableProps> = ({ reload, setReload }) => {
  const [reportRequests, setReportRequests] = useState<ReportRequestResponse[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const perPageItem = 10;

  const reportRequestList = useGet<{ success: boolean; data: ReportRequestResponse[]; totalCount: number }>(
    [`reportRequestList`, String(currentPage)],
    GET?.Custom_Report + '/listReportRequest' + `?page=${currentPage}&limit=${perPageItem}`,
    !!currentPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [reload]);

  useEffect(() => {
    if (currentPage === 1 && reload) {
      reportRequestList.refetch();
      setReload(false);
    }
  }, [currentPage, reload]);

  useEffect(() => {
    if (reportRequestList?.data?.data) {
      if (currentPage === 1) {
        setReportRequests([...reportRequestList?.data?.data]);
      } else {
        setReportRequests((prev) => [...prev, ...reportRequestList?.data?.data]);
      }
    }
  }, [reportRequestList?.data?.data]);

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage]);

  const lastRowRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (reportRequestList.isFetching || reportRequests.length >= reportRequestList?.data?.totalCount!) return;

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
    [reportRequestList.isFetching] // Add the correct dependency
  );

  if (!reportRequestList.isFetching && !reportRequests.length) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        sx={{ textAlign: 'center', marginTop: 10 }}
        alignContent="center"
        alignItems="center"
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          No report requests have been made yet.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ width: '100%' }} aria-label="attribute-option-table">
        <TableHead>
          <TableRow>
            <StyledTableCell>REPORT TYPE</StyledTableCell>
            <StyledTableCell>VERSION VALUE</StyledTableCell>
            <StyledTableCell>STATUS</StyledTableCell>
            <StyledTableCell>CREATED AT</StyledTableCell>
            <StyledTableCell>ACTION</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportRequests.map((data, dataIndex) => (
            <React.Fragment key={data._id}>
              <StyledTableRow ref={reportRequests.length === dataIndex + 1 ? lastElementRef : null}>
                <StyledTableCell>{data?.customReportId?.reportName || '-'}</StyledTableCell>
                <StyledTableCell>{data?.versionValue || '-'}</StyledTableCell>
                <StyledTableCell>{data?.status || '-'}</StyledTableCell>
                <StyledTableCell>{data.createdAt ? new Date(data.createdAt).toLocaleString() : '-'}</StyledTableCell>
                <StyledTableCell>
                  {data?.status && data.status === 'processed' ? <Button>Download</Button> : '-'}
                </StyledTableCell>
              </StyledTableRow>
            </React.Fragment>
          ))}

          {reportRequestList.isFetching &&
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

export default ReportRequestTable;
