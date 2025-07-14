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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.table?.headerBackground || theme.palette.background.default,
    color: theme.palette.table?.headerText || theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightMedium,
    borderBottom: `2px solid ${theme.palette.divider}`,
    fontSize: '14px',
    padding: '12px 16px',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '14px',
    color: theme.palette.table?.rowText || theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: '12px 16px',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.table?.rowOddBackground || theme.palette.background.paper,
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.table?.rowEvenBackground || theme.palette.background.default,
  },
  '&:hover': {
    backgroundColor: theme.palette.table?.rowHoverBackground || theme.palette.action.hover,
    transition: 'background-color 0.2s ease-in-out',
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

interface ThemeTableProps {
  columns: string[];
  rows: Array<{ [key: string]: any }>;
  stickyHeader?: boolean;
  maxHeight?: string | number;
  sx?: any;
}

const ThemeTable: React.FC<ThemeTableProps> = ({
  columns,
  rows,
  stickyHeader = false,
  maxHeight,
  sx = {},
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
              <StyledTableCell key={column} align="center">
                {column.toUpperCase()}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <StyledTableRow key={rowIndex}>
              {columns.map((column) => (
                <StyledTableCell key={column} align="center">
                  {row[column] !== undefined ? row[column].toString() : '-'}
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