// import Typography from '@mui/material/Typography';
import { Box, Button, useTheme, Card, CardContent } from '@mui/material';
import { useState } from 'react';
import CreateUpdateDataSource from '../../components/atom/dataSource/createUpdateDataSource';
import DataSourceTable from '../../components/atom/dataSource/dataSourceTable';
import { STYLE_GUIDE } from '../../styles';

export default function DataSource() {
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
        <Card 
          sx={{ 
            borderRadius: STYLE_GUIDE.SPACING.s2,
            boxShadow: STYLE_GUIDE.SHADOWS.base,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <CardContent sx={{ padding: STYLE_GUIDE.SPACING.s4 }}>
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              sx={{
                // flexWrap: 'wrap-reverse',
                gap: STYLE_GUIDE.SPACING.s4,
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
                        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xl,
                        padding: `${STYLE_GUIDE.SPACING.s4} ${STYLE_GUIDE.SPACING.s6}`,
                        bgcolor: STYLE_GUIDE.COLORS.bootstrapPrimary,
                        color: STYLE_GUIDE.COLORS.white,
                        '&:hover': { bgcolor: STYLE_GUIDE.COLORS.darkDarker },
                        '@media (max-width: 600px)': {
                          fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
                          padding: `${STYLE_GUIDE.SPACING.s3} ${STYLE_GUIDE.SPACING.s4}`,
                        },
                      }}
                    >
                      Create New Data Source
                    </Button>
                  }
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            borderRadius: STYLE_GUIDE.SPACING.s2,
            boxShadow: STYLE_GUIDE.SHADOWS.base,
            backgroundColor: theme.palette.background.paper,
            flexGrow: 1,
          }}
        >
          <CardContent sx={{ padding: 0 }}>
            <Box mt={STYLE_GUIDE.SPACING.s8} sx={{ overflowX: 'auto', flexGrow: 1 }}>
              <DataSourceTable reload={reload} setReload={setReload} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
