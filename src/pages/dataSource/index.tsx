// import Typography from '@mui/material/Typography';
import { Box, Button, Card, CardContent } from "@mui/material";
import { useState } from "react";
import CreateUpdateDataSource from "../../components/atom/dataSource/createUpdateDataSource";
import DataSourceTable from "../../components/atom/dataSource/dataSourceTable";
import { STYLE_GUIDE } from "../../styles";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import PrimaryButton from "../../components/common/PrimaryButton";
import CommonPageHeader from "../../components/atom/commonPageHeader";

export default function DataSource() {
  const theme = useUnifiedTheme();
  const [reload, setReload] = useState(false);

  return (
    <Box sx={{ p: STYLE_GUIDE.SPACING.s2 }}>
      <CommonPageHeader
        title="Data Source"
        actions={
          <CreateUpdateDataSource
            setReload={setReload}
            title="Create New Data Source"
            CustomButton={
              <PrimaryButton variant="contained">
                Create New Data Source
              </PrimaryButton>
            }
          />
        }
      />
      <Box sx={{ mt: 4 }}>
        <DataSourceTable reload={reload} setReload={setReload} />
      </Box>
    </Box>
  );
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
          height: "calc(100vh - 70px)",
          "@media (max-width: 600px)": {
            p: STYLE_GUIDE.SPACING.s2,
            gap: STYLE_GUIDE.SPACING.s2,
          },
        }}
      >
        <Card
          sx={{
            height: "20%",
            display: "flex",
            flexDirection: "column",
            borderRadius: STYLE_GUIDE.SPACING.s2,
            boxShadow: theme.palette.card?.shadow || theme.shadows[1],
            transition: "all 0.3s ease-in-out",
            backgroundColor:
              theme.palette.card?.background ||
              STYLE_GUIDE.COLORS.backgroundSurface,
            border: `1px solid ${
              theme.palette.card?.border || theme.palette.divider
            }`,
            "&:hover": {
              boxShadow: theme.shadows[3],
              transform: "translateY(-2px)",
            },
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
                        "&:hover": { bgcolor: STYLE_GUIDE.COLORS.darkDarker },
                        "@media (max-width: 600px)": {
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
            boxShadow: theme.palette.card?.shadow || theme.shadows[1],
            backgroundColor:
              theme.palette.card?.background ||
              STYLE_GUIDE.COLORS.backgroundSurface,
            border: `1px solid ${
              theme.palette.card?.border || theme.palette.divider
            }`,
          }}
        >
          <CardContent sx={{ padding: 0 }}>
            <Box
              mt={STYLE_GUIDE.SPACING.s8}
              sx={{ overflowX: "auto", flexGrow: 1 }}
            >
              <DataSourceTable reload={reload} setReload={setReload} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
