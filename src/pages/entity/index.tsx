import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import CustomizedTables from '../../components/atom/table/customizedTable';

export default function Entity() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Box display="flex" flexDirection="column" p={1} gap={10} width="100%">
        <Box>
          <Button
            aria-describedby={id}
            variant="contained"
            onClick={handleClick}
            size="large"
            sx={{ fontWeight: 'bold', fontSize: 'large', padding: 3, width: '100%' }}
          >
            Create New Entity
          </Button>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
          </Popover>
        </Box>
        <Box>
          <CustomizedTables
            rows={[
              {
                _id: '676a6c53715a96cf1d7f7692',
                name: 'Disclosure',
                description: 'This entity represents a product in the system.',
                // attributes: [
                //   {
                //     name: 'Disclosure Number',
                //     type: 'text',
                //     validation: ['required', 'minLength:5'],
                //     transformations: ['trimSpace', 'makeAllCapital'],
                //     cleaner: [],
                //   },
                //   {
                //     name: 'SBU',
                //     type: 'multioption',
                //     validation: ['required', 'minLength:2'],
                //     transformations: [],
                //     optionAttributeId: '12345789101112',
                //     cleaner: ['trimSpace'],
                //   },
                // ],
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
                // attributes: [
                //   {
                //     name: 'Disclosure Number',
                //     type: 'text',
                //     validation: ['required', 'minLength:5'],
                //     transformations: ['trimSpace', 'makeAllCapital'],
                //     cleaner: [],
                //   },
                //   {
                //     name: 'SBU',
                //     type: 'multioption',
                //     validation: ['required', 'minLength:2'],
                //     transformations: [],
                //     optionAttributeId: '12345789101112',
                //     cleaner: ['trimSpace'],
                //   },
                // ],
                organizationId: '66de96d3548d06560e2931cb',
                createdBy: '66b34cbbd40e24fca2e3e312',
                createdAt: '2024-12-24T08:05:32.592Z',
                updatedAt: '2024-12-24T08:05:32.592Z',
                __v: 0,
              },
            ]}
            columns={['name', 'description', 'attributes']}
          />
          ;
        </Box>
      </Box>
    </>
  );
}
