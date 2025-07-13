import { Box, Button, useTheme } from '@mui/material';
import { useState } from 'react';
import CreateDataSourceVersion from '../../components/atom/dataSourceVerion/createDataSourceVersion';
import DataSourceVersionTable from '../../components/atom/dataSourceVerion/dataSourceVersionTable';
import { STYLE_GUIDE } from '../../styles';

export default function DataSourceVersion() {
  const theme = useTheme();
  const [reload, setReload] = useState(false);

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        p={STYLE_GUIDE.SPACING.s4}
        gap={STYLE_GUIDE.SPACING.s8}
        width="100%"
        bgcolor={theme.palette.background.paper}
        sx={{
          height: 'calc(100vh - 70px)',
          '@media (max-width: 600px)': {
            p: STYLE_GUIDE.SPACING.s2,
            gap: STYLE_GUIDE.SPACING.s2,
          },
        }}
      >
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          sx={{
            gap: STYLE_GUIDE.SPACING.s4,
          }}
        >
          <Box>
            <CreateDataSourceVersion
              setReload={setReload}
              title="Create New Data Source Version"
              CustomButton={
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                    fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xl,
                    padding: `${STYLE_GUIDE.SPACING.s4} ${STYLE_GUIDE.SPACING.s6}`,
                    bgcolor: STYLE_GUIDE.COLORS.bootstrapPrimary,
                    color: STYLE_GUIDE.COLORS.white,
                    '&:hover': { bgcolor: STYLE_GUIDE.COLORS.bootstrapPrimaryHover },
                    '@media (max-width: 600px)': {
                      fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
                      padding: `${STYLE_GUIDE.SPACING.s3} ${STYLE_GUIDE.SPACING.s4}`,
                    },
                  }}
                >
                  Create Data Source Version
                </Button>
              }
            />
          </Box>
        </Box>

        <Box mt={STYLE_GUIDE.SPACING.s8} sx={{ overflowX: 'auto', flexGrow: 1 }}>
          <DataSourceVersionTable reload={reload} setReload={setReload} />
        </Box>
      </Box>
    </>
  );
}
