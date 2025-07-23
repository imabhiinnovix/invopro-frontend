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
                  {column === 'description' && typeof row[column] === 'string' && row[column]?.length > 15 ? (
                    <Tooltip title={row[column]} placement="top">
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {row[column].slice(0, 21)}
                        <MoreHorizIcon fontSize="small" style={{ marginLeft: 4 }} />
                      </span>
                    </Tooltip>
                  ) : React.isValidElement(row[column])
                    ? row[column]
                    : row[column] === null
                      ? '-'
                      : row[column] !== undefined && row[column] !== 'undefined'
                        ? row[column].toString()
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