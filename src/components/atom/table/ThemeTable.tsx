import React from 'react';
import { styled } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  tableCellClasses,
} from '@mui/material';
import { STYLE_GUIDE } from '../../../styles';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Tooltip from '@mui/material/Tooltip';

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

interface ThemeTableColumn {
  key: string;
  label: string;
}

interface ThemeTableProps {
  columns: ThemeTableColumn[];
  rows: Array<{ [key: string]: any }>;
  stickyHeader?: boolean;
  maxHeight?: string | number;
  sx?: any;
  onRowClick?: (row: any, rowIndex: number) => void;
}

const ThemeTable: React.FC<ThemeTableProps> = ({
  columns,
  rows,
  stickyHeader = false,
  maxHeight,
  sx = {},
  onRowClick,
}) => {
  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        maxHeight: maxHeight || 'calc(100vh - 300px)',
        overflow: 'auto',
        ...sx 
      }}
    >
      <Table stickyHeader={stickyHeader} sx={{ width: '100%' }} aria-label="theme table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <StyledTableCell key={column.key} align="center">
                {column.label}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <StyledTableRow 
              key={rowIndex}
              onClick={() => onRowClick?.(row, rowIndex)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': {
                  backgroundColor: onRowClick 
                    ? (theme) => theme.palette.table?.rowHoverBackground || STYLE_GUIDE.COLORS.backgroundHover
                    : 'inherit',
                },
              }}
            >
              {columns.map((column) => (
                <StyledTableCell key={column.key} align="center">
                  {column.key === 'description' && typeof row[column.key] === 'string' && row[column.key]?.length > 15 ? (
                    <Tooltip title={row[column.key]} placement="top">
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {row[column.key].slice(0, 21)}
                        <MoreHorizIcon fontSize="small" style={{ marginLeft: 4 }} />
                      </span>
                    </Tooltip>
                  ) : React.isValidElement(row[column.key])
                    ? row[column.key]
                    : row[column.key] === null
                      ? '-'
                      : row[column.key] !== undefined && row[column.key] !== 'undefined'
                        ? row[column.key].toString()
                        : '-'}
                </StyledTableCell>
              ))}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ThemeTable; 