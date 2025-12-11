import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../hooks/useComponentTypography";
import { SourcePreference } from "./types";
import { DataSourceType } from "../../components/atom/dataSource/types";

// -------------------------------------------------------------------------------

// -------------------------------------------------------------------------------

const SourceList = () => {
  const [selections, setSelections] = useState<
    Record<string, SourcePreference>
  >({});

  const theme = useUnifiedTheme();
  const { getHeadingSx } = useComponentTypography();

  const dataSourceList = useGet<{
    success: boolean;
    data: DataSourceType[];
    totalCount: number;
  }>([`dataSourceList`], GET?.DATA_SOURCE_LIST, true);

  const sources = useMemo(
    () => dataSourceList.data?.data ?? [],
    [dataSourceList.data]
  );

  useEffect(() => {
    if (!sources.length) return;

    setSelections((prev) => {
      const next = { ...prev };
      sources.forEach((item) => {
        if (!item._id) return;

        if (!next[item._id] && item.visibility) {
          next[item._id] = item.visibility;
        }
      });

      return next;
    });
  }, [sources]);

  const handlePreferenceChange = (id: string, value: SourcePreference) => {
    setSelections((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <Box
      sx={{
        p: STYLE_GUIDE.SPACING.s2,
        display: "flex",
        flexDirection: "column",
        gap: STYLE_GUIDE.SPACING.s4,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          ...getHeadingSx(),
          mb: STYLE_GUIDE?.SPACING?.s3,
        }}
      >
        Source List
      </Typography>

      <Card
        sx={{
          boxShadow: theme.palette.card?.shadow || theme.shadows[1],
          backgroundColor:
            theme.palette.card?.background || theme.palette.background.default,
        }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {dataSourceList.isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : dataSourceList.isError ? (
            <Typography color="error">
              Unable to load sources. Please try again.
            </Typography>
          ) : !sources.length ? (
            <Typography color="text.secondary">
              No data sources available.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {sources.map((source) => (
                <Box
                  key={source._id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {source.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {source.code || "No code"}
                        {source.versionType ? ` • ${source.versionType}` : ""}
                      </Typography>
                      {source.description ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {source.description}
                        </Typography>
                      ) : null}
                    </Box>
                    <RadioGroup
                      row
                      value={selections[source._id] || "hide"}
                      onChange={(event) =>
                        handlePreferenceChange(
                          source._id,
                          event.target.value as SourcePreference
                        )
                      }
                    >
                      <FormControlLabel
                        value="primary"
                        control={<Radio size="small" />}
                        label="Primary"
                      />
                      <FormControlLabel
                        value="secondary"
                        control={<Radio size="small" />}
                        label="Secondary"
                      />
                      <FormControlLabel
                        value="hide"
                        control={<Radio size="small" />}
                        label="Hide"
                      />
                    </RadioGroup>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SourceList;
