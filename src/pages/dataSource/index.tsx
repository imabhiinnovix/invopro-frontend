// import Typography from '@mui/material/Typography';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import CreateUpdateDataSource from '../../components/atom/dataSource/createUpdateDataSource';
import DataSourceTable from '../../components/atom/dataSource/dataSourceTable';

export default function DataSource() {
  const [reload, setReload] = useState(false);
  return (
    <>
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
            // flexWrap: 'wrap-reverse',
            gap: 2,
          }}
        >
          <Box>
            <CreateUpdateDataSource
              setReload={setReload}
              title="Create New Data Source"
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
                  Create New Data Source
                </Button>
              }
            />
          </Box>
        </Box>

        <Box mt={4} sx={{ overflowX: 'auto', flexGrow: 1 }}>
          <DataSourceTable reload={reload} setReload={setReload} />
        </Box>
      </Box>
    </>
  );
}
