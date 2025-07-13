import { useState } from 'react';
import AttributeOptionTable from '../../components/atom/attributeOption/attributeOptionTable';
import CreateUpdateAttributeOption from '../../components/atom/attributeOption/createUpdateAttributeOption';
import { Box, Button, useTheme } from '@mui/material';
import { STYLE_GUIDE } from '../../styles';

export default function AttributeOption() {
  const theme = useTheme();
  const [attributeOptionReload, setAttributeOptionReload] = useState(false);
  return (
    
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
        <CreateUpdateAttributeOption
          setAttributeOptionReload={setAttributeOptionReload}
          title="Create New Attribute Option"
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
