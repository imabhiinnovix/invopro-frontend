import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { STYLE_GUIDE } from "../../../styles";
import usePost from "../../../hooks/usePost";
import { POST } from "../../../services/apiRoutes";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../../hooks/useComponentTypography";
import { FieldVisibilityPreference } from "./types";
import { DataSourceType } from "../../../components/atom/dataSource/types";

const SourceAttributes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const source = location.state?.source as DataSourceType | undefined;
  
  const [selections, setSelections] = useState<
    Record<string, FieldVisibilityPreference>
  >({});

  const theme = useUnifiedTheme();
  const { getHeadingSx } = useComponentTypography();

  const fieldSettings = useMemo(
    () => source?.fieldSettings ?? [],
    [source]
  );

  const sourceName = useMemo(
    () => source?.name ?? "",
    [source]
  );

  useEffect(() => {
    if (!fieldSettings.length) return;

    setSelections((prev) => {
      const next = { ...prev };
      fieldSettings.forEach((field) => {
        if (!field.attributeId) return;

        if (!next[field.attributeId] && field.visibility) {
          next[field.attributeId] = field.visibility;
        }
      });

      return next;
    });
  }, [fieldSettings]);

  const createFieldVisibilitySetting = usePost<
    { dataSourceId: string; attributeId: string; visibility: FieldVisibilityPreference },
    { success: boolean; message: string }
  >([`dataSourceDetail`, id ?? ""], undefined, true);

  const handlePreferenceChange = (
    attributeId: string,
    value: FieldVisibilityPreference
  ) => {
    setSelections((prev) => ({
      ...prev,
      [attributeId]: value,
    }));

    if (!id) return;

    createFieldVisibilitySetting.mutate({
      url: POST.ORGANIZATION_VISIBILITY_SETTING_CREATE,
      payload: {
        dataSourceId: id,
        attributeId,
        visibility: value,
      },
    });
  };


  const handleBack = () => {
    navigate("/system-settings/charts/source-list");
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={handleBack} sx={{ p: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h4"
          sx={{
            ...getHeadingSx(),
            mb: 0,
          }}
        >
          {sourceName} - Field Settings
        </Typography>
      </Box>

      <Card
        sx={{
          boxShadow: theme.palette.card?.shadow || theme.shadows[1],
          backgroundColor:
            theme.palette.card?.background || theme.palette.background.default,
        }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {!source ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <Typography color="text.secondary">
                No source data available. Please navigate from the source list.
              </Typography>
            </Box>
          ) : !fieldSettings.length ? (
            <Typography color="text.secondary">
              No field settings available for this source.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {fieldSettings.map((field) => (
                <Box
                  key={field.attributeId}
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
                        {field.label}
                      </Typography>
                    </Box>
                    <RadioGroup
                      row
                      value={selections[field.attributeId] || "hide"}
                      onChange={(event) =>
                        handlePreferenceChange(
                          field.attributeId,
                          event.target.value as FieldVisibilityPreference
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

export default SourceAttributes;
