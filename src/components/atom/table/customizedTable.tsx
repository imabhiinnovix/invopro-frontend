import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

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
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

type Row = {
  [key: string]: string | number | any[] | boolean;
};

type CustomizedTablesProps = {
  columns: string[];
  rows: Row[];
};

const CustomizedTables: React.FC<CustomizedTablesProps> = ({ rows, columns }) => {
  const [expandedRows, setExpandedRows] = React.useState<{ [key: number]: boolean }>({});

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const renderAttributes = (attributes: any[]) => (
    <Box sx={{ margin: 1 }}>
      <Table size="small" aria-label="attributes">
        <TableHead>
          <TableRow>
            <StyledTableCell>Attribute Name</StyledTableCell>
            <StyledTableCell>Attribute Type</StyledTableCell>
            <StyledTableCell>Attribute Validation</StyledTableCell>
            <StyledTableCell>Attribute Transformations</StyledTableCell>
            <StyledTableCell>Attribute Cleaner</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attributes.map((attr, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{attr.name ? attr.name : '-'}</StyledTableCell>
              <StyledTableCell>{attr.type ? attr.type : '-'}</StyledTableCell>
              <StyledTableCell>
                {attr.validation && attr.validation.length > 0 ? attr.validation.join(', ') : '-'}
              </StyledTableCell>
              <StyledTableCell>
                {attr.transformations && attr.transformations.length > 0 ? attr.transformations.join(', ') : '-'}
              </StyledTableCell>
              <StyledTableCell>
                {attr.cleaner && attr.cleaner.length > 0 ? attr.cleaner.join(', ') : '-'}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  return (
    <TableContainer component={Paper}>
      <Table sx={{ width: '100%' }} aria-label="customized table">
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
            <React.Fragment key={rowIndex}>
              <StyledTableRow>
                {columns.map((column) => (
                  <StyledTableCell key={column} align="center">
                    {column === 'attributes' && Array.isArray(row[column]) ? (
                      <IconButton aria-label="expand row" size="small" onClick={() => toggleRow(rowIndex)}>
                        {expandedRows[rowIndex] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    ) : row[column] !== undefined ? (
                      row[column].toString()
                    ) : (
                      '-'
                    )}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
              {columns.includes('attributes') && Array.isArray(row.attributes) && (
                <StyledTableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length}>
                    <Collapse in={expandedRows[rowIndex]} timeout="auto" unmountOnExit>
                      {renderAttributes(row.attributes)}
                    </Collapse>
                  </TableCell>
                </StyledTableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomizedTables;
