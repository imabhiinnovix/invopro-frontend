// import Typography from '@mui/material/Typography';
import { Box, Button } from '@mui/material';
import CreateUpdateEntity from '../../components/atom/entity/createUpdateEntity';
import EntityTable from '../../components/atom/entity/entityTable';
import { useState } from 'react';

export default function Entity() {
  const [reloadEntity, setReloadEntity] = useState(false);
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
            <CreateUpdateEntity
              setReloadEntity={setReloadEntity}
              title="Create New Entity"
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
                  Create New Entity
                </Button>
              }
            />
          </Box>

          {/* <Box display="flex" gap={3} flexWrap="wrap" justifyContent="center">
            <Box
              sx={{
                borderRadius: 2,
                bgcolor: '#28a745',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                boxShadow: 2,
                p: 4,
                minWidth: '120px',
                '@media (max-width: 600px)': {
                  fontSize: '16px',
                  p: 2,
                },
              }}
            >
              Active Entities
              <Typography variant="h4" fontWeight="bold" sx={{ '@media (max-width: 600px)': { fontSize: '24px' } }}>
                2
              </Typography>
            </Box>
            <Box
              sx={{
                borderRadius: 2,
                bgcolor: '#dc3545',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                boxShadow: 2,
                p: 4,
                minWidth: '120px',
                '@media (max-width: 600px)': {
                  fontSize: '16px',
                  p: 2,
                },
              }}
            >
              Inactive Entities
              <Typography variant="h4" fontWeight="bold" sx={{ '@media (max-width: 600px)': { fontSize: '24px' } }}>
                2
              </Typography>
            </Box>
          </Box> */}
        </Box>

        <Box mt={4} sx={{ overflowX: 'auto', flexGrow: 1 }}>
          <EntityTable reloadEntity={reloadEntity} setReloadEntity={setReloadEntity} />
        </Box>
      </Box>
    </>
  );
}
