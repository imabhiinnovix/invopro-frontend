import { useState } from 'react';
import AttributeOptionTable from '../../components/atom/attributeOption/attributeOptionTable';
import CreateUpdateAttributeOption from '../../components/atom/attributeOption/createUpdateAttributeOption';
import { Box, Button } from '@mui/material';

export default function AttributeOption() {
  const [attributeOptionReload, setAttributeOptionReload] = useState(false);
  return (
    
    <Box
      display="flex"
      flexDirection="column"
      p={2}
      gap={4}
      width="100%"
      bgcolor="#f9f9f9"
      sx={{
        height: 'calc(100vh - 70px)',
        '@media (max-width: 600px)': {
          p: 1,
          gap: 1,
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        sx={{
          gap: 2,
        }}
      >
        <CreateUpdateAttributeOption
          setAttributeOptionReload={setAttributeOptionReload}
          title="Create New Attribute Option"
          CustomButton={
            <Button
              variant="contained"
              size="large"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.2rem',
                padding: '15px 30px',
                bgcolor: '#007bff',
                color: '#fff',
                '&:hover': { bgcolor: '#0056b3' },
                '@media (max-width: 600px)': {
                  fontSize: '1rem',
                  padding: '10px 20px',
                },
              }}
            >
              Create New Attribute Option
            </Button>
          }
        />
      </Box>

      <AttributeOptionTable
        attributeOptionReload={attributeOptionReload}
        setAttributeOptionReload={setAttributeOptionReload}
      />
    </Box>
  );
}
