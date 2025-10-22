import { Box, Button } from "@mui/material";
import { useState } from "react";
import CreateDataSourceVersion from "../../components/atom/dataSourceVerion/createDataSourceVersion";
import DataSourceVersionTable from "../../components/atom/dataSourceVerion/dataSourceVersionTable";
import { STYLE_GUIDE } from "../../styles";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import CommonPageHeader from "../../components/atom/commonPageHeader";
import PrimaryButton from "../../components/common/PrimaryButton";

export default function DataSourceVersion() {
  const theme = useUnifiedTheme();
  const [reload, setReload] = useState(false);

  return (
    <Box
      sx={{
        p: STYLE_GUIDE.SPACING.s2,
      }}
    >
      <CommonPageHeader
        title="Data Source Version"
        actions={
          <CreateDataSourceVersion
            setReload={setReload}
            title="Create New Data Source Version"
            CustomButton={
              <PrimaryButton variant="contained">
                Create Data Source Version
              </PrimaryButton>
            }
          />
        }
      />

      <DataSourceVersionTable reload={reload} setReload={setReload} />
    </Box>
  );
}
