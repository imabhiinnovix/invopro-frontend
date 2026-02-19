import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { STYLE_GUIDE } from "../../styles";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import usePut from "../../hooks/usePut";
import { GET, POST, PUT } from "../../services/apiRoutes";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import { PageHeader, PageCardLayout } from "../../components/common";
import { SourcePreference } from "./types";
import { DataSourceType } from "../../components/atom/dataSource/types";

// -------------------------------------------------------------------------------

// -------------------------------------------------------------------------------

const SourceList = () => {
  const navigate = useNavigate();
  const [selections, setSelections] = useState<
    Record<string, SourcePreference>
  >({});

  const theme = useUnifiedTheme();

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

  const createVisibilitySetting = usePost<
    { dataSourceId: string; visibility: SourcePreference },
    { success: boolean; message: string }
  >([`dataSourceList`], undefined, true);

  const updateVisibilitySetting = usePut<
    { visibility: SourcePreference; dataSourceId: string },
    { success: boolean; message: string }
  >([`dataSourceList`], undefined, true);

  const { data: visibilitySettingsData } = useGet<{
    data: Array<{
      _id: string;
      dataSourceId: string;
      visibility: SourcePreference;
    }>;
  }>(
    [`visibilitySettingsList`],
    `${GET.ORGANIZATION_VISIBILITY_SETTING_LIST}`,
    true
  );

  const handlePreferenceChange = (
    event: React.MouseEvent,
    id: string,
    value: SourcePreference
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setSelections((prev) => ({
      ...prev,
      [id]: value,
    }));

    const existingSetting = visibilitySettingsData?.data?.find(
      (setting) => setting.dataSourceId === id
    );

    if (existingSetting) {
      updateVisibilitySetting.mutate({
        url: `${PUT.ORGANIZATION_VISIBILITY_SETTING_UPDATE}/${existingSetting._id}`,
        payload: {
          dataSourceId: existingSetting.dataSourceId,
          visibility: value,
        },
      });
    } else {
      createVisibilitySetting.mutate({
        url: POST.ORGANIZATION_VISIBILITY_SETTING_CREATE,
        payload: {
          dataSourceId: id,
          visibility: value,
        },
      });
    }
  };

  const handleSourceClick = (source: DataSourceType) => {
    navigate(`/system-settings/charts/source-list/attributes/${source._id}`, {
      state: { source },
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PageHeader
        title="Source List"
        subtext="Manage chart data source visibility (Primary, Secondary, Hide)."
      />

      <PageCardLayout>
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
                  onClick={() => handleSourceClick(source)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper,
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[4],
                      borderColor: theme.palette.primary.main,
                    },
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
                        {source.name}
                      </Typography>
                    </Box>
                    <RadioGroup
                      row
                      value={selections[source._id] || "hide"}
                      onChange={(event) =>
                        handlePreferenceChange(
                          event as unknown as React.MouseEvent,
                          source._id,
                          event.target.value as SourcePreference
                        )
                      }
                      onClick={(event) => event.stopPropagation()}
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

export default SourceList;
