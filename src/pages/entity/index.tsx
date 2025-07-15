// import Typography from '@mui/material/Typography';
import { Box, Button } from '@mui/material';
import CreateUpdateEntity from '../../components/atom/entity/createUpdateEntity';
import EntityTable from '../../components/atom/entity/entityTable';
import { useState } from 'react';
import { STYLE_GUIDE } from '../../styles';
import { useUnifiedTheme } from '../../hooks/useUnifiedTheme';

export default function Entity() {
  const theme = useUnifiedTheme();
  const [reloadEntity, setReloadEntity] = useState(false);
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
            <CreateUpdateEntity
              setReloadEntity={setReloadEntity}
              title="Create New Entity"
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
                  Create New Entity
                </Button>
              }
            />
          </Box>

          {/* <Box display="flex" gap={3} flexWrap="wrap" justifyContent="center">
            <Box
              sx={{
                borderRadius: STYLE_GUIDE.SPACING.s4,
                bgcolor: STYLE_GUIDE.COLORS.bootstrapSuccess,
                color: STYLE_GUIDE.COLORS.white,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xl,
                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                boxShadow: STYLE_GUIDE.SHADOWS.base,
                p: STYLE_GUIDE.SPACING.s8,
                minWidth: '120px',
                '@media (max-width: 600px)': {
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
                  p: STYLE_GUIDE.SPACING.s4,
                },
              }}
            >
              Active Entities
              <Typography variant="h4" fontWeight={STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold} sx={{ '@media (max-width: 600px)': { fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xl } }}>
                2
              </Typography>
            </Box>
            <Box
              sx={{
                borderRadius: STYLE_GUIDE.SPACING.s4,
                bgcolor: STYLE_GUIDE.COLORS.bootstrapDanger,
                color: STYLE_GUIDE.COLORS.white,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xl,
                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                boxShadow: STYLE_GUIDE.SHADOWS.base,
                p: STYLE_GUIDE.SPACING.s8,
                minWidth: '120px',
                '@media (max-width: 600px)': {
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.large,
                  p: STYLE_GUIDE.SPACING.s4,
                },
              }}
            >
              Inactive Entities
              <Typography variant="h4" fontWeight={STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold} sx={{ '@media (max-width: 600px)': { fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xl } }}>
                2
              </Typography>
            </Box>
          </Box> */}
        </Box>

        <Box mt={STYLE_GUIDE.SPACING.s8} sx={{ overflowX: 'auto', flexGrow: 1 }}>
          <EntityTable reloadEntity={reloadEntity} setReloadEntity={setReloadEntity} />
        </Box>
      </Box>
    </>
  );
}
