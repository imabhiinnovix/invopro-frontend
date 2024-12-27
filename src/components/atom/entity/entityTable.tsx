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
import { Button, Switch, Typography } from '@mui/material';

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

const EntityTable = () => {
  const [expandedRows, setExpandedRows] = React.useState<{ [key: number]: boolean }>({});

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const entityData = [
    {
      _id: '676a6c53715a96cf1d7f7692',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      isActive: true,
      createdAt: '2024-12-24T08:09:55.279Z',
      updatedAt: '2024-12-24T08:09:55.279Z',
      __v: 0,
    },
    {
      _id: '676a6b4c758e6afd6bb1de3c',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      createdAt: '2024-12-24T08:05:32.592Z',
      updatedAt: '2024-12-24T08:05:32.592Z',
      __v: 0,
    },
    {
      _id: '676a6c53715a96cf1d7f7692',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      isActive: true,
      createdAt: '2024-12-24T08:09:55.279Z',
      updatedAt: '2024-12-24T08:09:55.279Z',
      __v: 0,
    },
    {
      _id: '676a6b4c758e6afd6bb1de3c',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      createdAt: '2024-12-24T08:05:32.592Z',
      updatedAt: '2024-12-24T08:05:32.592Z',
      __v: 0,
    },
    {
      _id: '676a6c53715a96cf1d7f7692',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      isActive: true,
      createdAt: '2024-12-24T08:09:55.279Z',
      updatedAt: '2024-12-24T08:09:55.279Z',
      __v: 0,
    },
    {
      _id: '676a6b4c758e6afd6bb1de3c',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      createdAt: '2024-12-24T08:05:32.592Z',
      updatedAt: '2024-12-24T08:05:32.592Z',
      __v: 0,
    },
    {
      _id: '676a6c53715a96cf1d7f7692',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      isActive: true,
      createdAt: '2024-12-24T08:09:55.279Z',
      updatedAt: '2024-12-24T08:09:55.279Z',
      __v: 0,
    },
    {
      _id: '676a6b4c758e6afd6bb1de3c',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      createdAt: '2024-12-24T08:05:32.592Z',
      updatedAt: '2024-12-24T08:05:32.592Z',
      __v: 0,
    },
    {
      _id: '676a6c53715a96cf1d7f7692',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      isActive: true,
      createdAt: '2024-12-24T08:09:55.279Z',
      updatedAt: '2024-12-24T08:09:55.279Z',
      __v: 0,
    },
    {
      _id: '676a6b4c758e6afd6bb1de3c',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      createdAt: '2024-12-24T08:05:32.592Z',
      updatedAt: '2024-12-24T08:05:32.592Z',
      __v: 0,
    },
    {
      _id: '676a6c53715a96cf1d7f7692',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      isActive: true,
      createdAt: '2024-12-24T08:09:55.279Z',
      updatedAt: '2024-12-24T08:09:55.279Z',
      __v: 0,
    },
    {
      _id: '676a6b4c758e6afd6bb1de3c',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      createdAt: '2024-12-24T08:05:32.592Z',
      updatedAt: '2024-12-24T08:05:32.592Z',
      __v: 0,
    },
    {
      _id: '676a6c53715a96cf1d7f7692',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      isActive: true,
      createdAt: '2024-12-24T08:09:55.279Z',
      updatedAt: '2024-12-24T08:09:55.279Z',
      __v: 0,
    },
    {
      _id: '676a6b4c758e6afd6bb1de3c',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      createdAt: '2024-12-24T08:05:32.592Z',
      updatedAt: '2024-12-24T08:05:32.592Z',
      __v: 0,
    },
    {
      _id: '676a6c53715a96cf1d7f7692',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      isActive: true,
      createdAt: '2024-12-24T08:09:55.279Z',
      updatedAt: '2024-12-24T08:09:55.279Z',
      __v: 0,
    },
    {
      _id: '676a6b4c758e6afd6bb1de3c',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      createdAt: '2024-12-24T08:05:32.592Z',
      updatedAt: '2024-12-24T08:05:32.592Z',
      __v: 0,
    },
    {
      _id: '676a6c53715a96cf1d7f7692',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      isActive: true,
      createdAt: '2024-12-24T08:09:55.279Z',
      updatedAt: '2024-12-24T08:09:55.279Z',
      __v: 0,
    },
    {
      _id: '676a6b4c758e6afd6bb1de3c',
      name: 'Disclosure',
      description: 'This entity represents a product in the system.',
      attributes: [
        {
          name: 'Disclosure Number',
          type: 'text',
          validation: ['required', 'minLength:5'],
          transformations: ['trimSpace', 'makeAllCapital'],
          cleaner: [],
        },
        {
          name: 'SBU',
          type: 'multioption',
          validation: ['required', 'minLength:2'],
          transformations: [],
          optionAttributeId: '12345789101112',
          cleaner: ['trimSpace'],
        },
      ],
      organizationId: '66de96d3548d06560e2931cb',
      createdBy: '66b34cbbd40e24fca2e3e312',
      createdAt: '2024-12-24T08:05:32.592Z',
      updatedAt: '2024-12-24T08:05:32.592Z',
      __v: 0,
    },
  ];

  const renderAttributes = (attributes: any[]) => (
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
            <StyledTableCell>NAME</StyledTableCell>
            <StyledTableCell>DESCRIPTION</StyledTableCell>
            <StyledTableCell>ATTRIBUTES</StyledTableCell>
            <StyledTableCell>STATUS</StyledTableCell>
            <StyledTableCell>ACTION</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entityData.map((data, dataIndex) => (
            <React.Fragment key={dataIndex}>
              <StyledTableRow>
                <StyledTableCell>{data.name ? data.name : '-'}</StyledTableCell>
                <StyledTableCell>{data.description ? data.description : '-'}</StyledTableCell>
                <StyledTableCell>
                  {data.attributes && data.attributes.length > 0 ? (
                    <IconButton aria-label="expand row" size="small" onClick={() => toggleRow(dataIndex)}>
                      {expandedRows[dataIndex] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  ) : (
                    '-'
                  )}
                </StyledTableCell>
                <StyledTableCell>{data.isActive ? <Switch defaultChecked /> : <Switch />}</StyledTableCell>
                <StyledTableCell>
                  <Button>Edit</Button>
                </StyledTableCell>
              </StyledTableRow>
              <StyledTableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                  <Collapse in={expandedRows[dataIndex]} timeout="auto" unmountOnExit>
                    {renderAttributes(data.attributes)}
                  </Collapse>
                </TableCell>
              </StyledTableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EntityTable;
