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
import { useComponentTypography } from '../../../hooks/useComponentTypography';

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
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.table?.rowOddBackground || STYLE_GUIDE.COLORS.backgroundDefault,
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.table?.rowEvenBackground || STYLE_GUIDE.COLORS.white,
  },
  '&:hover': {
    backgroundColor: theme.palette.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover,
  },
}));

interface AttributeOptionTableProps {
  reload: boolean;
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataSourceTable: React.FC<AttributeOptionTableProps> = ({ reload, setReload }) => {
  console.log("reeeeload",reload)
  const { getHeadingSx, getTableSx } = useComponentTypography();
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const perPageItem = 10;

  const dataSourceList = useGet<{ success: boolean; data: DataSourceType[]; totalCount: number }>(
    [`dataSourceList-${currentPage}`],
    GET?.Data_Source_List + `?page=${currentPage}&limit=${perPageItem}`,
    true // Pass enabled as boolean
  );

  // Handle onSuccess logic
  useEffect(() => {
    if (dataSourceList.data) {
      console.log('API response:', dataSourceList.data);
    }
  }, [dataSourceList.data]);

  const loadMoreData = useCallback(async () => {
    if (loading || !hasMore) return;
    
    console.log(`Loading page ${currentPage + 1}`);
    setLoading(true);
    setCurrentPage(prev => {
      console.log('Incrementing page to', prev + 1);
      return prev + 1;
    });
  }, [loading, hasMore, currentPage]);

  useEffect(() => {
    if (dataSourceList?.data?.success && dataSourceList?.data?.data) {
      const newData = dataSourceList.data.data;
      const totalCount = dataSourceList.data.totalCount;

      console.log('New data received:', newData, 'Total count:', totalCount);

      if (currentPage === 1) {
        setDataSource(newData);
      } else {
        setDataSource(prev => {
          const existingIds = new Set(prev.map(item => item._id));
          const filteredNewData = newData.filter(item => !existingIds.has(item._id));
          console.log('Appending new data:', filteredNewData);
          return [...prev, ...filteredNewData];
        });
      }

      const totalLoaded = currentPage * perPageItem;
      if (totalLoaded >= totalCount || newData.length < perPageItem) {
        setHasMore(false);
        console.log('No more data to load');
      }

      setLoading(false);
    }
  }, [dataSourceList?.data, currentPage]);

  useEffect(() => {
    if (dataSourceList.isFetching && currentPage > 1) {
      setLoading(true);
    } else if (!dataSourceList.isFetching) {
      setLoading(false);
    }
    if (dataSourceList.error) {
      console.error('API error:', dataSourceList.error);
      setLoading(false);
    }
  }, [dataSourceList.isFetching, dataSourceList.error, currentPage]);

  useEffect(() => {
    if (reload) {
      console.log('Reloading data');
      setDataSource([]);
      setCurrentPage(1);
      setLoading(false);
      setHasMore(true);
      setReload(false);
    }
  }, [reload, setReload]);

  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            console.log('Triggering load more');
            loadMoreData();
          }
        },
        {
          root: null,
          rootMargin: '0px 0px 100px 0px',
          threshold: 0.1,
        }
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMoreData]
  );

  useEffect(() => {
    console.log({
      currentPage,
      dataLength: dataSource.length,
      loading,
      hasMore,
      isFetching: dataSourceList.isFetching,
    });
  }, [currentPage, dataSource.length, loading, hasMore, dataSourceList.isFetching]);

  if (dataSourceList.isFetching && currentPage === 1 && dataSource.length === 0) {
    return (
      <TableContainer component={Paper} sx={{ ...getTableSx() }}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
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
        sx={{ textAlign: 'center', marginTop: 10 }}
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
          No data sources have been created yet. Please create a data source to display it here.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        ...getTableSx(),
        maxHeight: '600px',
        overflowY: 'auto',
      }}
    >
      <Table sx={{ width: '100%' }} aria-label="data-source-table" stickyHeader>
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
              <StyledTableCell>{data.name || '-'}</StyledTableCell>
              <StyledTableCell>{data.description || '-'}</StyledTableCell>
              <StyledTableCell>{data.code || '-'}</StyledTableCell>
              <StyledTableCell>{data.versionType || '-'}</StyledTableCell>
              <StyledTableCell>{data.entityId?.name || '-'}</StyledTableCell>
              <StyledTableCell>
                {data.createdBy ? `${data.createdBy.firstName} ${data.createdBy.lastName}` : '-'}
              </StyledTableCell>
              <StyledTableCell>
                {data.updatedBy ? `${data.updatedBy.firstName} ${data.updatedBy.lastName}` : '-'}
              </StyledTableCell>
              <StyledTableCell>{data.createdAt ? new Date(data.createdAt).toLocaleString() : '-'}</StyledTableCell>
              <StyledTableCell>{data.updatedAt ? new Date(data.updatedAt).toLocaleString() : '-'}</StyledTableCell>
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

          {loading && (
            <StyledTableRow>
              <StyledTableCell colSpan={11}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <Skeleton width="100%" height={40} />
                </Box>
              </StyledTableCell>
            </StyledTableRow>
          )}

          {!hasMore && dataSource.length > 0 && (
            <StyledTableRow>
              <StyledTableCell colSpan={11}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    All data loaded ({dataSource.length} items)
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
