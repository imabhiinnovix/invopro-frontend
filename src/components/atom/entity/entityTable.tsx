import * as React from 'react';
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
  Switch,
  Skeleton,
  Typography,
  tableCellClasses,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import useGet from '../../../hooks/useGet';
import { GET } from '../../../services/apiRoutes';
import CreateEntity from './createEntity';

type Attribute = {
  name: string;
  type: string;
  validation?: string[];
  transformations?: string[];
  cleaner?: string[];
  optionAttributeId?: string;
};

type Entity = {
  _id: string;
  name: string;
  description: string;
  attributes: Attribute[];
  organizationId: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

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

const EntityTable: React.FC = () => {
  const [expandedRows, setExpandedRows] = React.useState<{ [key: number]: boolean }>({});

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const { data: entityData, isLoading } = useGet<{ success: boolean; data: Entity[]; totalCount: number }>(
    ['entityList'],
    GET?.Entity_List,
  );

  const renderAttributes = (attributes: Attribute[] = []) => (
    <Box sx={{ margin: 1 }}>
      <Table size="small" aria-label="attributes">
        <TableHead>
          <TableRow>
            <StyledTableCell>ATTRIBUTE NAME</StyledTableCell>
            <StyledTableCell>ATTRIBUTE TYPE</StyledTableCell>
            <StyledTableCell>ATTRIBUTE VALIDATION</StyledTableCell>
            <StyledTableCell>ATTRIBUTE TRANSFORMATIONS</StyledTableCell>
            <StyledTableCell>ATTRIBUTE CLEANER</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attributes.map((attr, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{attr.name || '-'}</StyledTableCell>
              <StyledTableCell>{attr.type || '-'}</StyledTableCell>
              <StyledTableCell>{attr.validation?.length ? attr.validation.join(', ') : '-'}</StyledTableCell>
              <StyledTableCell>{attr.transformations?.length ? attr.transformations.join(', ') : '-'}</StyledTableCell>
              <StyledTableCell>{attr.cleaner?.length ? attr.cleaner.join(', ') : '-'}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  if (isLoading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>NAME</StyledTableCell>
              <StyledTableCell>DESCRIPTION</StyledTableCell>
              <StyledTableCell>ATTRIBUTES</StyledTableCell>
              <StyledTableCell>STATUS</StyledTableCell>
              <StyledTableCell>ACTION</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <StyledTableRow key={index}>
                {[...Array(5)].map((_, colIndex) => (
                  <StyledTableCell key={colIndex}>
                    <Skeleton height={40} />
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!entityData?.data.length) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        sx={{ textAlign: 'center', marginTop: 10 }}
        alignContent="center"
        alignItems="center"
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          No entities have been created yet. Please create an entity to display it here.
        </Typography>
        <Box maxWidth="600px">
          <CreateEntity />
        </Box>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ width: '100%' }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>NAME</StyledTableCell>
            <StyledTableCell>DESCRIPTION</StyledTableCell>
            <StyledTableCell>ATTRIBUTES</StyledTableCell>
            <StyledTableCell>STATUS</StyledTableCell>
            <StyledTableCell>ACTION</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entityData?.data.map((data, dataIndex) => (
            <React.Fragment key={data._id}>
              <StyledTableRow>
                <StyledTableCell>{data.name || '-'}</StyledTableCell>
                <StyledTableCell>{data.description || '-'}</StyledTableCell>
                <StyledTableCell>
                  {data.attributes?.length ? (
                    <IconButton aria-label="expand row" size="small" onClick={() => toggleRow(dataIndex)}>
                      {expandedRows[dataIndex] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  ) : (
                    '-'
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  <Switch checked={data.isActive} />
                </StyledTableCell>
                <StyledTableCell>
                  <Button>Edit</Button>
                </StyledTableCell>
              </StyledTableRow>
              {data.attributes?.length > 0 && (
                <StyledTableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={expandedRows[dataIndex]} timeout="auto" unmountOnExit>
                      {renderAttributes(data.attributes)}
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

export default EntityTable;
