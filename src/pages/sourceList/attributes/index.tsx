import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { STYLE_GUIDE } from "../../../styles";
import { PageHeader, PageCardLayout } from "../../../components/common";
import usePost from "../../../hooks/usePost";
import useGet from "../../../hooks/useGet";
import usePut from "../../../hooks/usePut";
import { POST, GET, PUT } from "../../../services/apiRoutes";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
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

  const fieldSettings = useMemo(() => source?.fieldSettings ?? [], [source]);

  const sourceName = useMemo(() => source?.name ?? "", [source]);

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
    {
      dataSourceId: string;
      attributeId: string;
      visibility: FieldVisibilityPreference;
    },
    { success: boolean; message: string }
  >([`dataSourceDetail`, id ?? ""], undefined, true);

  const updateFieldVisibilitySetting = usePut<
    {
      dataSourceId: string;
      attributeId: string;
      visibility: FieldVisibilityPreference;
    },
    { success: boolean; message: string }
  >([`dataSourceDetail`, id ?? ""], undefined, true);

  const { data: visibilitySettingsData } = useGet<{
    data: Array<{
      _id: string;
      dataSourceId: string;
      attributeId: string;
      visibility: FieldVisibilityPreference;
    }>;
  }>(
    [`visibilitySettings`, id ?? ""],
    `${GET.ORGANIZATION_VISIBILITY_SETTING_LIST}?dataSourceId=${id}`,
    !!id
  );

  console.log("visibilitySettingsData", visibilitySettingsData);

  const handlePreferenceChange = (
    event: React.MouseEvent,
    attributeId: string,
    value: FieldVisibilityPreference
  ) => {
    event.stopPropagation();

    setSelections((prev) => ({
      ...prev,
      [attributeId]: value,
    }));

    const updatedSource = source
      ? {
          ...source,
          fieldSettings:
            source.fieldSettings?.map((field) =>
              field.attributeId === attributeId
                ? { ...field, visibility: value }
                : field
            ) || [],
        }
      : undefined;

    navigate(
      {
        pathname: location.pathname,
      },
      {
        replace: true,
        state: { ...location.state, source: updatedSource },
      }
    );

    if (!id) return;

    const existingSetting = visibilitySettingsData?.data?.find(
      (setting) =>
        setting.attributeId === attributeId && setting.dataSourceId === id
    );

    if (existingSetting) {
      updateFieldVisibilitySetting.mutate({
        url: `${PUT.ORGANIZATION_VISIBILITY_SETTING_UPDATE}/${existingSetting._id}`,
        payload: {
          dataSourceId: existingSetting?.dataSourceId,
          attributeId: existingSetting?.attributeId,
          visibility: value,
        },
      });
    } else {
      createFieldVisibilitySetting.mutate({
        url: POST.ORGANIZATION_VISIBILITY_SETTING_CREATE,
        payload: {
          dataSourceId: id,
          attributeId,
          visibility: value,
        },
      });
    }
  };

  const handleBack = () => {
    navigate("/system-settings/charts/source-list");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: STYLE_GUIDE.SPACING.s4,
      }}
    >
      <PageHeader
        title={`${sourceName} - Field Settings`}
        onBack={handleBack}
      />

      <PageCardLayout>
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
                    alignItems: "center",
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
                        event as unknown as React.MouseEvent,
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
      </PageCardLayout>
    </Box>
  );
};

export default SourceAttributes;
